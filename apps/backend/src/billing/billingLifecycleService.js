const { getPrisma } = require('../data/prisma');
const { sendTransactionalEmail } = require('../email/resendClient');

const FAILURE_WINDOW_DAYS = 7;
const FAILURE_PAUSE_THRESHOLD = 3;

function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function buildRetryDelayMinutes(attemptCount) {
  if (attemptCount <= 1) return 5;
  if (attemptCount === 2) return 15;
  return 60;
}

function toDate(value) {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
}

async function pauseCampaignsForOrganization(prisma, organizationId) {
  const result = await prisma.campaign.updateMany({
    where: { organization_id: organizationId, status: { not: 'paused' } },
    data: { status: 'paused' },
  });

  await prisma.auditLog.create({
    data: {
      organization_id: organizationId,
      user_id: null,
      action: 'campaigns_paused',
      resource_type: 'campaign',
      resource_id: null,
      metadata: { reason: 'billing_lifecycle' },
    },
  });

  return result.count || 0;
}

async function cancelSubscriptionForOrganization(prisma, organization, reason) {
  await prisma.organization.update({
    where: { id: organization.id },
    data: { subscription_status: 'canceled' },
  });

  await prisma.subscription.updateMany({
    where: { organization_id: organization.id },
    data: {
      status: 'canceled',
      cancel_at_period_end: false,
    },
  });

  await prisma.campaign.updateMany({
    where: { organization_id: organization.id, status: { not: 'paused' } },
    data: { status: 'paused' },
  });

  await prisma.auditLog.create({
    data: {
      organization_id: organization.id,
      user_id: null,
      action: 'subscription_canceled_lifecycle',
      resource_type: 'subscription',
      resource_id: organization.stripe_subscription_id || null,
      metadata: { reason },
    },
  });

  if (organization.billing_email) {
    await sendTransactionalEmail({
      to: organization.billing_email,
      subject: 'Subscription canceled',
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
          <h1>Subscription canceled</h1>
          <p>Your VoiceAgent subscription for ${organization.name} has ended.</p>
          <p>Please reactivate billing if you want to restore access.</p>
        </div>
      `,
    });
  }
}

async function recordStripeWebhookEvent(event, deps = {}) {
  const prisma = deps.prisma || getPrisma();
  const organizationId = event?.data?.object?.metadata?.org_id || event?.data?.object?.organization_id;

  if (!organizationId || !prisma?.stripeWebhookEvent?.upsert) {
    return null;
  }

  return prisma.stripeWebhookEvent.upsert({
    where: { stripe_event_id: event.id },
    update: {
      event_type: event.type,
      payload: event,
      status: 'pending',
      attempt_count: 0,
      last_error: null,
      processed_at: null,
      next_retry_at: null,
    },
    create: {
      organization_id: organizationId,
      stripe_event_id: event.id,
      event_type: event.type,
      payload: event,
      status: 'pending',
      attempt_count: 0,
    },
  });
}

async function markStripeWebhookEventProcessed(eventRow, deps = {}) {
  const prisma = deps.prisma || getPrisma();
  return prisma.stripeWebhookEvent.update({
    where: { id: eventRow.id },
    data: {
      status: 'processed',
      processed_at: new Date(),
      last_error: null,
      next_retry_at: null,
    },
  });
}

async function markStripeWebhookEventFailed(eventRow, error, deps = {}) {
  const prisma = deps.prisma || getPrisma();
  const attemptCount = Number(eventRow.attempt_count || 0) + 1;
  return prisma.stripeWebhookEvent.update({
    where: { id: eventRow.id },
    data: {
      status: 'failed',
      attempt_count: attemptCount,
      last_error: error.message,
      next_retry_at: addDays(new Date(), buildRetryDelayMinutes(attemptCount) / (24 * 60)),
    },
  });
}

async function retryPendingStripeWebhookEvents(deps = {}) {
  const prisma = deps.prisma || getPrisma();
  const handler = deps.handleStripeEvent || require('./stripeWebhooks').handleStripeEvent;
  const now = deps.now || new Date();

  const events = await prisma.stripeWebhookEvent.findMany({
    where: {
      status: 'failed',
      OR: [
        { next_retry_at: null },
        { next_retry_at: { lte: now } },
      ],
    },
    orderBy: { created_at: 'asc' },
  });

  let processed = 0;
  let failed = 0;

  for (const eventRow of events) {
    try {
      await handler(eventRow.payload, deps);
      await markStripeWebhookEventProcessed(eventRow, deps);
      processed += 1;
    } catch (error) {
      await markStripeWebhookEventFailed(eventRow, error, deps);
      failed += 1;
    }
  }

  return { processed, failed, queued: events.length };
}

async function enforceBillingLifecycle(deps = {}) {
  const prisma = deps.prisma || getPrisma();
  const now = deps.now || new Date();
  const windowStart = addDays(now, -FAILURE_WINDOW_DAYS);
  const organizations = await prisma.organization.findMany({
    where: { subscription_status: 'past_due' },
  });

  let paused = 0;
  let canceled = 0;

  for (const organization of organizations) {
    const failureCount = await prisma.auditLog.count({
      where: {
        organization_id: organization.id,
        action: 'invoice_payment_failed',
        created_at: { gte: windowStart },
      },
    });

    const firstFailure = await prisma.auditLog.findFirst({
      where: {
        organization_id: organization.id,
        action: 'invoice_payment_failed',
      },
      orderBy: { created_at: 'asc' },
    });

    if (failureCount >= FAILURE_PAUSE_THRESHOLD) {
      paused += await pauseCampaignsForOrganization(prisma, organization.id) > 0 ? 1 : 0;
    }

    if (firstFailure && now.getTime() - toDate(firstFailure.created_at).getTime() >= FAILURE_WINDOW_DAYS * 24 * 60 * 60 * 1000) {
      await cancelSubscriptionForOrganization(prisma, organization, 'payment_failure_timeout');
      canceled += 1;
    }
  }

  return { paused, canceled };
}

async function expireScheduledSubscriptions(deps = {}) {
  const prisma = deps.prisma || getPrisma();
  const now = deps.now || new Date();
  const subscriptions = await prisma.subscription.findMany({
    where: {
      cancel_at_period_end: true,
      current_period_end: { lte: now },
      status: { not: 'canceled' },
    },
    include: {
      organization: true,
    },
  });

  let canceled = 0;

  for (const subscription of subscriptions) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'canceled',
        cancel_at_period_end: false,
        canceled_at: now,
      },
    });

    await cancelSubscriptionForOrganization(prisma, subscription.organization, 'scheduled_cancellation');
    canceled += 1;
  }

  return { canceled };
}

module.exports = {
  recordStripeWebhookEvent,
  markStripeWebhookEventProcessed,
  markStripeWebhookEventFailed,
  retryPendingStripeWebhookEvents,
  enforceBillingLifecycle,
  expireScheduledSubscriptions,
  pauseCampaignsForOrganization,
  cancelSubscriptionForOrganization,
};
