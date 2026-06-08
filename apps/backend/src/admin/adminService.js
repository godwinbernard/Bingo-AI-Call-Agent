const crypto = require('crypto');
const { getPrisma } = require('../data/prisma');
const { getStripe, getPriceIdForTier, PLAN_CATALOG } = require('../billing/stripeClient');
const { sendTransactionalEmail } = require('../email/resendClient');

const PLAN_MRR = {
  STARTER: 9900,
  GROWTH: 29900,
  ENTERPRISE: 99900,
  PAY_AS_YOU_GO: 0,
};

function formatCurrency(amountInCents) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amountInCents / 100);
}

function formatDate(value) {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getPlanLimit(tier) {
  const plan = PLAN_CATALOG[tier] || PLAN_CATALOG.STARTER;
  return Number.isFinite(plan.calls_per_month) ? plan.calls_per_month : null;
}

function getPlanMrr(tier) {
  return PLAN_MRR[tier] || 0;
}

function buildCallsLabel(organization) {
  const limit = getPlanLimit(organization.subscription_tier);
  if (limit === null) {
    return 'Unlimited';
  }

  return `${Number(organization.calls_used_this_month || 0).toLocaleString()} / ${limit.toLocaleString()}`;
}

function issueImpersonationToken(payload) {
  const signature = crypto
    .createHmac('sha256', process.env.ADMIN_SECRET || 'dev-admin-secret')
    .update(JSON.stringify(payload))
    .digest('hex');

  return Buffer.from(JSON.stringify({ payload, signature })).toString('base64url');
}

function verifyImpersonationToken(token) {
  if (!token) {
    return null;
  }

  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));
    const expectedSignature = crypto
      .createHmac('sha256', process.env.ADMIN_SECRET || 'dev-admin-secret')
      .update(JSON.stringify(decoded.payload))
      .digest('hex');

    if (decoded.signature !== expectedSignature) {
      return null;
    }

    if (decoded.payload?.expiresAt && new Date(decoded.payload.expiresAt).getTime() <= Date.now()) {
      return null;
    }

    return decoded.payload || null;
  } catch {
    return null;
  }
}

async function buildAdminOverview(deps = {}) {
  const prisma = deps.prisma || getPrisma();
  const now = deps.now || new Date();

  const organizations = await prisma.organization.findMany({
    select: {
      subscription_tier: true,
      subscription_status: true,
      created_at: true,
      updated_at: true,
      calls_used_this_month: true,
    },
  });

  const totalOrganizations = typeof prisma.organization.count === 'function'
    ? await prisma.organization.count()
    : organizations.length;

  const activeTrials = organizations.filter((organization) => organization.subscription_status === 'trialing').length;
  const churnedThisMonth = organizations.filter((organization) => {
    if (organization.subscription_status !== 'canceled') {
      return false;
    }

    const createdAt = new Date(organization.updated_at || organization.created_at);
    return createdAt.getUTCFullYear() === now.getUTCFullYear()
      && createdAt.getUTCMonth() === now.getUTCMonth();
  }).length;

  const totalCallsToday = typeof prisma.call?.count === 'function'
    ? await prisma.call.count({
      where: {
        started_at: {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        },
      },
    })
    : organizations.reduce((sum, organization) => sum + Math.floor(Number(organization.calls_used_this_month || 0) / 30), 0);

  const mrr = organizations.reduce((sum, organization) => sum + getPlanMrr(organization.subscription_tier), 0);

  return {
    totalOrganizations,
    mrr,
    activeTrials,
    churnedThisMonth,
    totalCallsToday,
  };
}

async function buildAdminCustomers(deps = {}) {
  const prisma = deps.prisma || getPrisma();
  const organizations = await prisma.organization.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      members: {
        select: { id: true },
      },
    },
  });

  return organizations.map((organization) => ({
    id: organization.id,
    name: organization.name,
    plan: organization.subscription_tier,
    mrr: formatCurrency(getPlanMrr(organization.subscription_tier)),
    calls: buildCallsLabel(organization),
    status: organization.subscription_status,
    joined: formatDate(organization.created_at),
    trialEndsAt: organization.trial_ends_at ? formatDate(organization.trial_ends_at) : null,
    memberCount: organization.members?.length || 0,
    billingEmail: organization.billing_email,
    stripeCustomerId: organization.stripe_customer_id,
  }));
}

async function buildAdminRevenueSummary(deps = {}) {
  const prisma = deps.prisma || getPrisma();
  const organizations = await prisma.organization.findMany({
    select: {
      subscription_tier: true,
      subscription_status: true,
      created_at: true,
      updated_at: true,
    },
  });

  const invoices = typeof prisma.invoice?.findMany === 'function'
    ? await prisma.invoice.findMany({
      orderBy: { created_at: 'asc' },
      select: {
        amount_paid: true,
        created_at: true,
      },
    })
    : [];

  const mrr = organizations.reduce((sum, organization) => sum + getPlanMrr(organization.subscription_tier), 0);
  const activeOrganizations = organizations.filter((organization) => organization.subscription_status === 'active').length;
  const trialOrganizations = organizations.filter((organization) => organization.subscription_status === 'trialing').length;
  const churnedOrganizations = organizations.filter((organization) => organization.subscription_status === 'canceled').length;
  const ltvEstimate = mrr * 12;

  const monthlyRevenue = new Map();
  for (const invoice of invoices) {
    const monthKey = new Date(invoice.created_at).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
    monthlyRevenue.set(monthKey, (monthlyRevenue.get(monthKey) || 0) + Number(invoice.amount_paid || 0));
  }

  return {
    mrr: formatCurrency(mrr),
    activeOrganizations,
    trialOrganizations,
    churnedOrganizations,
    ltvEstimate: formatCurrency(ltvEstimate),
    mrrCents: mrr,
    revenueChart: Array.from(monthlyRevenue.entries()).map(([label, value]) => ({
      label,
      value,
      valueLabel: formatCurrency(value),
    })),
  };
}

async function extendTrialForOrganization(deps = {}) {
  const prisma = deps.prisma || getPrisma();
  const days = Number(deps.days || 7);
  const organization = await prisma.organization.update({
    where: { id: deps.organizationId },
    data: {
      trial_ends_at: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      subscription_status: 'trialing',
    },
  });

  await prisma.auditLog?.create?.({
    data: {
      organization_id: deps.organizationId,
      user_id: deps.userId || null,
      action: 'trial_extended',
      resource_type: 'organization',
      resource_id: deps.organizationId,
      metadata: { days },
    },
  });

  return { extended: true, organization };
}

async function changeOrganizationPlan(deps = {}) {
  const prisma = deps.prisma || getPrisma();
  const stripe = deps.stripe || (process.env.STRIPE_SECRET_KEY ? getStripe() : null);
  const organization = await prisma.organization.findUnique({
    where: { id: deps.organizationId },
  });

  if (!organization) {
    const error = new Error('Organization not found');
    error.statusCode = 404;
    throw error;
  }

  const billingCycle = deps.billingCycle || 'month';
  const priceId = getPriceIdForTier(deps.tier, billingCycle);

  if (organization.stripe_subscription_id && stripe?.subscriptions?.update) {
    await stripe.subscriptions.update(organization.stripe_subscription_id, {
      items: [{ price: priceId }],
      proration_behavior: 'create_prorations',
      metadata: {
        org_id: organization.id,
        tier: deps.tier,
      },
    });
  }

  const updatedOrganization = await prisma.organization.update({
    where: { id: organization.id },
    data: {
      subscription_tier: deps.tier,
      subscription_status: organization.subscription_status === 'trialing' ? 'trialing' : 'active',
    },
  });

  const subscriptionData = {
    tier: deps.tier,
    stripe_price_id: priceId,
    status: organization.subscription_status === 'trialing' ? 'trialing' : 'active',
  };

  if (typeof prisma.subscription?.update === 'function') {
    await prisma.subscription.update({
      where: { organization_id: organization.id },
      data: subscriptionData,
    });
  } else {
    await prisma.subscription.updateMany?.({
      where: { organization_id: organization.id },
      data: subscriptionData,
    });
  }

  await prisma.auditLog?.create?.({
    data: {
      organization_id: organization.id,
      user_id: deps.userId || null,
      action: 'plan_changed',
      resource_type: 'organization',
      resource_id: organization.id,
      metadata: { tier: deps.tier, billingCycle, priceId },
    },
  });

  return { changed: true, organization: updatedOrganization, priceId };
}

async function impersonateOrganization(deps = {}) {
  const prisma = deps.prisma || getPrisma();
  const organization = await prisma.organization.findUnique({
    where: { id: deps.organizationId },
    select: { id: true, name: true, slug: true },
  });

  if (!organization) {
    const error = new Error('Organization not found');
    error.statusCode = 404;
    throw error;
  }

  const payload = {
    organizationId: organization.id,
    supportUserId: deps.userId || null,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  };
  const impersonationToken = issueImpersonationToken(payload);
  const baseUrl = deps.baseUrl || process.env.BASE_URL || 'http://localhost:3001';

  await prisma.auditLog?.create?.({
    data: {
      organization_id: organization.id,
      user_id: deps.userId || null,
      action: 'organization_impersonated',
      resource_type: 'organization',
      resource_id: organization.id,
      metadata: { supportUserId: deps.userId || null },
    },
  });

  return {
    impersonation_token: impersonationToken,
    impersonation_url: `${baseUrl.replace(/\/$/, '')}/dashboard?impersonate=${impersonationToken}`,
    organization,
  };
}

module.exports = {
  buildAdminOverview,
  buildAdminCustomers,
  buildAdminRevenueSummary,
  extendTrialForOrganization,
  changeOrganizationPlan,
  impersonateOrganization,
  issueImpersonationToken,
  verifyImpersonationToken,
};
