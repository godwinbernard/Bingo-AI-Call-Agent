const { getPrisma } = require('../data/prisma');
const { getStripe, PLAN_CATALOG, getPriceIdForTier, tierFromPriceId } = require('./stripeClient');
const { buildWelcomeEmail } = require('../email/templates/welcomeEmail');
const { buildTrialEndingEmail } = require('../email/templates/trialEndingEmail');
const { buildPaymentFailedEmail } = require('../email/templates/paymentFailedEmail');
const { buildInviteTeamEmail } = require('../email/templates/inviteTeamEmail');
const { buildInvoiceEmail } = require('../email/templates/invoiceEmail');
const { sendTransactionalEmail } = require('../email/resendClient');
const { upsertInvoiceFromStripe } = require('./invoiceService');
const { pauseCampaignsForOrganization } = require('./billingLifecycleService');

const TIER_ORDER = ['PAY_AS_YOU_GO', 'STARTER', 'GROWTH', 'ENTERPRISE'];

function normalizeSubscriptionStatus(status) {
  if (status === 'trialing') return 'trialing';
  if (status === 'past_due') return 'past_due';
  if (status === 'canceled' || status === 'incomplete_expired') return 'canceled';
  return 'active';
}

function getTierRank(tier) {
  const index = TIER_ORDER.indexOf(tier);
  return index === -1 ? 0 : index;
}

function getSubscriptionTier(subscription) {
  return tierFromPriceId(subscription.items?.data?.[0]?.price?.id)
    || subscription.metadata?.tier
    || 'GROWTH';
}

async function recordBillingAudit(prisma, organizationId, userId, action, metadata = {}, resourceType = 'subscription', resourceId = null) {
  if (!prisma?.auditLog?.create || !organizationId) {
    return null;
  }

  return prisma.auditLog.create({
    data: {
      organization_id: organizationId,
      user_id: userId || null,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata,
    },
  });
}

async function createCustomer(org, deps = {}) {
  const stripe = deps.stripe || getStripe();
  const prisma = deps.prisma || getPrisma();

  if (org.stripe_customer_id) {
    return stripe.customers.retrieve(org.stripe_customer_id);
  }

  const customer = await stripe.customers.create({
    name: org.billing_name || org.name,
    email: org.billing_email,
    metadata: {
      org_id: org.id,
      slug: org.slug,
    },
  });

  await prisma.organization.update({
    where: { id: org.id },
    data: { stripe_customer_id: customer.id },
  });

  return customer;
}

async function createCheckoutSession(org, tier, successUrl, cancelUrl, deps = {}) {
  const stripe = deps.stripe || getStripe();
  const customer = await createCustomer(org, deps);
  const priceId = getPriceIdForTier(tier, deps.billingCycle || 'month');

  return stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customer.id,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: org.trial_ends_at ? undefined : 14,
      metadata: {
        org_id: org.id,
        tier,
      },
    },
    metadata: {
      org_id: org.id,
      tier,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

async function createBillingPortalSession(org, returnUrl, deps = {}) {
  const stripe = deps.stripe || getStripe();
  const customer = await createCustomer(org, deps);

  return stripe.billingPortal.sessions.create({
    customer: customer.id,
    return_url: returnUrl,
  });
}

async function syncSubscriptionRecord(subscription, deps = {}) {
  const prisma = deps.prisma || getPrisma();
  const stripePriceId = subscription.items?.data?.[0]?.price?.id || subscription.plan?.id || '';
  const tier = getSubscriptionTier(subscription);
  const status = normalizeSubscriptionStatus(subscription.status);
  const organizationId = subscription.metadata?.org_id;

  if (!organizationId) {
    return null;
  }

  const payload = {
    stripe_subscription_id: subscription.id,
    stripe_price_id: stripePriceId,
    tier,
    status,
    current_period_start: new Date((subscription.current_period_start || Date.now() / 1000) * 1000),
    current_period_end: new Date((subscription.current_period_end || Date.now() / 1000) * 1000),
    cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
    canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
    trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
    trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
  };

  const organization = await prisma.organization.update({
    where: { id: organizationId },
    data: {
      stripe_subscription_id: subscription.id,
      subscription_tier: tier,
      subscription_status: status,
      trial_ends_at: payload.trial_end,
      usage_reset_date: new Date(),
    },
  });

  await prisma.subscription.upsert({
    where: { organization_id: organizationId },
    update: payload,
    create: {
      organization_id: organizationId,
      ...payload,
    },
  });

  await recordBillingAudit(
    prisma,
    organizationId,
    deps.userId,
    'subscription_synced',
    {
      tier,
      status,
      cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
      stripe_price_id: stripePriceId,
    },
    'subscription',
    subscription.id
  );

  return organization;
}

async function handleSubscriptionCreated(subscription, deps = {}) {
  const organization = await syncSubscriptionRecord(subscription, deps);
  if (!organization) return { skipped: true };

  await sendTransactionalEmail({
    to: organization.billing_email,
    ...buildWelcomeEmail({
      companyName: organization.name,
      dashboardUrl: deps.dashboardUrl || process.env.BASE_URL || 'http://localhost:3000/dashboard',
    }),
  });

  await recordBillingAudit(
    deps.prisma || getPrisma(),
    organization.id,
    deps.userId,
    'subscription_created',
    { tier: organization.subscription_tier, status: organization.subscription_status },
    'subscription',
    subscription.id
  );

  return { ok: true, organization };
}

async function handleSubscriptionUpdated(subscription, deps = {}) {
  const organization = await syncSubscriptionRecord(subscription, deps);
  if (!organization) return { skipped: true };

  const previousTier = deps.previousAttributes?.items?.data?.[0]?.price?.id
    ? tierFromPriceId(deps.previousAttributes.items.data[0].price.id)
    : deps.previousAttributes?.metadata?.tier
      ? deps.previousAttributes.metadata.tier
    : deps.previousAttributes?.plan?.id
      ? tierFromPriceId(deps.previousAttributes.plan.id)
      : null;
  const newTier = organization.subscription_tier;
  const scheduledCancellation = Boolean(subscription.cancel_at_period_end) && !deps.previousAttributes?.cancel_at_period_end;
  const tierChanged = previousTier && previousTier !== newTier;
  const isUpgrade = tierChanged && getTierRank(newTier) > getTierRank(previousTier);
  const isDowngrade = tierChanged && getTierRank(newTier) < getTierRank(previousTier);

  if (isUpgrade) {
    await sendTransactionalEmail({
      to: organization.billing_email,
      subject: `You're now on ${organization.subscription_tier} 🚀`,
      html: `<p>Your plan has been upgraded to ${organization.subscription_tier}. The new features are available immediately.</p>`,
    });
  } else if (isDowngrade) {
    await sendTransactionalEmail({
      to: organization.billing_email,
      subject: `Your plan will change to ${organization.subscription_tier}`,
      html: `<p>Your plan has been updated to ${organization.subscription_tier}. Some features will be removed at the next billing boundary.</p>`,
    });
  } else if (scheduledCancellation) {
    await sendTransactionalEmail({
      to: organization.billing_email,
      subject: 'Subscription scheduled for cancellation',
      html: `<p>Your subscription for ${organization.name} is set to cancel at the end of the current billing period.</p>`,
    });
  }

  await recordBillingAudit(
    deps.prisma || getPrisma(),
    organization.id,
    deps.userId,
    'subscription_updated',
    {
      previous_tier: previousTier,
      new_tier: newTier,
      is_upgrade: isUpgrade,
      is_downgrade: isDowngrade,
      cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
    },
    'subscription',
    subscription.id
  );

  return { ok: true, organization };
}

async function handleSubscriptionCanceled(subscription, deps = {}) {
  const prisma = deps.prisma || getPrisma();
  const organizationId = subscription.metadata?.org_id;
  if (!organizationId) return { skipped: true };

  const organization = await prisma.organization.update({
    where: { id: organizationId },
    data: {
      subscription_status: 'canceled',
      stripe_subscription_id: subscription.id,
    },
  });

  await sendTransactionalEmail({
    to: organization.billing_email,
    subject: 'Subscription canceled',
    html: `<p>Your subscription has been canceled for ${organization.name}.</p>`,
  });

  await recordBillingAudit(
    prisma,
    organizationId,
    deps.userId,
    'subscription_canceled',
    { subscription_id: subscription.id },
    'subscription',
    subscription.id
  );

  return { ok: true, organization };
}

async function handlePaymentFailed(invoice, deps = {}) {
  const prisma = deps.prisma || getPrisma();
  const stripe = deps.stripe || getStripe();
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return { skipped: true };

  const subscription = await prisma.subscription.findUnique({
    where: { stripe_subscription_id: subscriptionId },
    include: { organization: true },
  });
  if (!subscription) return { skipped: true };

  const organization = subscription.organization;
  await prisma.organization.update({
    where: { id: organization.id },
    data: { subscription_status: 'past_due' },
  });

  await upsertInvoiceFromStripe(invoice, deps);

  await sendTransactionalEmail({
    to: organization.billing_email,
    ...buildPaymentFailedEmail({
      companyName: organization.name,
      billingUrl: deps.billingUrl || `${process.env.BASE_URL || 'http://localhost:3000'}/billing`,
      amountDue: invoice.amount_due || 0,
    }),
  });

  await recordBillingAudit(
    prisma,
    organization.id,
    deps.userId,
    'invoice_payment_failed',
    { invoice_id: invoice.id, amount_due: invoice.amount_due || 0 },
    'invoice',
    invoice.id
  );

  const failureCount = await prisma.auditLog.count({
    where: {
      organization_id: organization.id,
      action: 'invoice_payment_failed',
      created_at: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    },
  });

  if (failureCount >= 3) {
    await pauseCampaignsForOrganization(prisma, organization.id);
  }

  return { ok: true, organization };
}

async function handleInvoicePaid(invoice, deps = {}) {
  const prisma = deps.prisma || getPrisma();
  const record = await upsertInvoiceFromStripe(invoice, deps);
  const organizationId = invoice.metadata?.org_id || record.organization_id;
  let organization = null;

  if (organizationId) {
    organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        name: true,
        billing_email: true,
      },
    });
  }

  if (!organization && invoice.metadata?.org_name && invoice.customer_email) {
    organization = { name: invoice.metadata.org_name, billing_email: invoice.customer_email };
  }

  if (organization?.billing_email) {
    await sendTransactionalEmail({
      to: organization.billing_email,
      ...buildInvoiceEmail({
        companyName: organization.name,
        invoiceUrl: invoice.hosted_invoice_url,
        amountPaid: invoice.amount_paid || 0,
        periodLabel: `${new Date((invoice.period_start || Date.now() / 1000) * 1000).toLocaleDateString()} - ${new Date((invoice.period_end || Date.now() / 1000) * 1000).toLocaleDateString()}`,
      }),
    });
  }

  if (organizationId) {
    await recordBillingAudit(
      prisma,
      organizationId,
      deps.userId,
      'invoice_paid',
      { invoice_id: invoice.id, amount_paid: invoice.amount_paid || 0 },
      'invoice',
      invoice.id
    );
  }

  return { ok: true, invoice: record };
}

async function sendTrialEndingEmail(organization, daysLeft, deps = {}) {
  return sendTransactionalEmail({
    to: organization.billing_email,
    ...buildTrialEndingEmail({
      companyName: organization.name,
      daysLeft,
      billingUrl: deps.billingUrl || `${process.env.BASE_URL || 'http://localhost:3000'}/billing`,
      usageSummary: deps.usageSummary || '',
    }),
  });
}

async function sendInviteEmail({ inviterName, companyName, role, acceptUrl, to }) {
  return sendTransactionalEmail({
    to,
    ...buildInviteTeamEmail({ inviterName, companyName, role, acceptUrl }),
  });
}

module.exports = {
  createCustomer,
  createCheckoutSession,
  createBillingPortalSession,
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionCanceled,
  handlePaymentFailed,
  handleInvoicePaid,
  sendTrialEndingEmail,
  sendInviteEmail,
  syncSubscriptionRecord,
  normalizeSubscriptionStatus,
};
