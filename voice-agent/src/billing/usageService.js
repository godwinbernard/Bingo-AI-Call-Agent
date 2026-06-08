const { getPrisma } = require('../data/prisma');
const { PLAN_CATALOG, getStripe } = require('./stripeClient');

function monthKey(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

function getTierLimit(tier) {
  const plan = PLAN_CATALOG[tier] || PLAN_CATALOG.GROWTH;
  return plan.calls_per_month === 'unlimited' ? Infinity : plan.calls_per_month;
}

async function getOrganizationUsage(organizationId, deps = {}) {
  const prisma = deps.prisma || getPrisma();
  return prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      subscription_tier: true,
      calls_used_this_month: true,
      usage_reset_date: true,
      trial_ends_at: true,
    },
  });
}

async function checkCallLimit(organizationId, deps = {}) {
  const usage = deps.usage || (await getOrganizationUsage(organizationId, deps));
  if (!usage) {
    throw new Error('Organization not found');
  }

  const limit = getTierLimit(usage.subscription_tier);
  if (limit === Infinity) {
    return {
      allowed: true,
      remaining: Infinity,
      limit: Infinity,
      percentage: 0,
    };
  }

  const used = Number(usage.calls_used_this_month || 0);
  const remaining = Math.max(limit - used, 0);
  const percentage = limit === 0 ? 100 : Math.min(100, Math.floor((used / limit) * 100));

  if (used >= limit) {
    const error = new Error('429: call limit reached');
    error.statusCode = 429;
    throw error;
  }

  return { allowed: true, remaining, limit, percentage };
}

async function incrementCallUsage(organizationId, minutes = 0, deps = {}) {
  const prisma = deps.prisma || getPrisma();
  const organization = await prisma.organization.update({
    where: { id: organizationId },
    data: {
      calls_used_this_month: { increment: 1 },
    },
  });

  const usageRecord = await prisma.usageRecord.create({
    data: {
      organization_id: organizationId,
      month: monthKey(),
      calls_made: 1,
      minutes_used: minutes,
      amount_cents: 0,
    },
  });

  if (organization.subscription_tier === 'PAY_AS_YOU_GO' && minutes > 0) {
    await reportPaygUsage(organizationId, minutes, deps);
  }

  return { organization, usageRecord };
}

async function resetMonthlyUsage(deps = {}) {
  const prisma = deps.prisma || getPrisma();
  const organizations = await prisma.organization.findMany();
  const now = new Date();
  const currentMonth = monthKey(now);

  for (const organization of organizations) {
    await prisma.usageRecord.create({
      data: {
        organization_id: organization.id,
        month: currentMonth,
        calls_made: organization.calls_used_this_month,
        minutes_used: 0,
        amount_cents: 0,
      },
    });

    await prisma.organization.update({
      where: { id: organization.id },
      data: {
        calls_used_this_month: 0,
        usage_reset_date: now,
      },
    });
  }

  return { reset: organizations.length };
}

async function getUsageSummary(organizationId, deps = {}) {
  const prisma = deps.prisma || getPrisma();
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      usage_records: { orderBy: { recorded_at: 'desc' }, take: 1 },
      subscriptions: { take: 1, orderBy: { created_at: 'desc' } },
    },
  });

  if (!organization) {
    throw new Error('Organization not found');
  }

  const limit = getTierLimit(organization.subscription_tier);
  const used = Number(organization.calls_used_this_month || 0);
  const percentage = limit === Infinity ? 0 : Math.min(100, Math.floor((used / limit) * 100));
  const remaining = limit === Infinity ? Infinity : Math.max(limit - used, 0);
  const daysUntilReset = organization.usage_reset_date
    ? Math.max(0, Math.ceil((new Date(organization.usage_reset_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;
  const costEstimate = organization.subscription_tier === 'PAY_AS_YOU_GO'
    ? Number(organization.usage_records?.[0]?.minutes_used || 0) * 0.08
    : 0;

  return {
    used,
    limit,
    remaining,
    percentage,
    days_until_reset: daysUntilReset,
    cost_estimate: costEstimate,
    trial_ends_at: organization.trial_ends_at,
  };
}

async function reportPaygUsage(organizationId, minutes, deps = {}) {
  const prisma = deps.prisma || getPrisma();
  const stripe = deps.stripe || getStripe();
  const subscription = await prisma.subscription.findUnique({
    where: { organization_id: organizationId },
  });

  if (!subscription || subscription.tier !== 'PAY_AS_YOU_GO') {
    return { skipped: true };
  }

  const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id, {
    expand: ['items.data.price'],
  });
  const subscriptionItemId = stripeSubscription.items.data[0]?.id;
  if (!subscriptionItemId) {
    return { skipped: true };
  }

  const usageRecord = await stripe.subscriptionItems.createUsageRecord(subscriptionItemId, {
    quantity: minutes,
    timestamp: Math.floor(Date.now() / 1000),
    action: 'increment',
  });

  return usageRecord;
}

module.exports = {
  monthKey,
  getTierLimit,
  getOrganizationUsage,
  checkCallLimit,
  incrementCallUsage,
  resetMonthlyUsage,
  getUsageSummary,
  reportPaygUsage,
};
