const { getStripe } = require('./stripeClient');
const {
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionCanceled,
  handlePaymentFailed,
  handleInvoicePaid,
} = require('./subscriptionService');
const { upsertInvoiceFromStripe } = require('./invoiceService');
const { getPrisma } = require('../data/prisma');
const {
  recordStripeWebhookEvent,
  markStripeWebhookEventProcessed,
  markStripeWebhookEventFailed,
} = require('./billingLifecycleService');

function verifyStripeSignature(rawBody, signature, endpointSecret) {
  const stripe = getStripe();
  try {
    return stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
  } catch (error) {
    const wrapped = new Error('Invalid Stripe signature');
    wrapped.cause = error;
    throw wrapped;
  }
}

async function recordStripeWebhookAudit(event, status, deps = {}, error = null) {
  const prisma = deps.prisma || getPrisma();
  const object = event?.data?.object || {};
  const organizationId = object.metadata?.org_id || object.organization_id || null;

  if (!prisma?.auditLog?.create || !organizationId) {
    return null;
  }

  return prisma.auditLog.create({
    data: {
      organization_id: organizationId,
      user_id: null,
      action: status === 'failed' ? 'stripe_webhook_failed' : 'stripe_webhook_received',
      resource_type: 'stripe_event',
      resource_id: event.id || object.id || null,
      metadata: {
        event_type: event.type,
        status,
        error: error ? error.message : null,
      },
    },
  });
}

async function handleStripeEvent(event, deps = {}) {
  switch (event.type) {
    case 'customer.subscription.created':
      return handleSubscriptionCreated(event.data.object, deps);
    case 'customer.subscription.updated':
      return handleSubscriptionUpdated(event.data.object, {
        ...deps,
        previousAttributes: event.data.previous_attributes || null,
      });
    case 'customer.subscription.deleted':
      return handleSubscriptionCanceled(event.data.object, deps);
    case 'customer.subscription.trial_will_end':
      return { ok: true, event: event.type };
    case 'invoice.payment_succeeded':
      await upsertInvoiceFromStripe(event.data.object, deps);
      return handleInvoicePaid(event.data.object, deps);
    case 'invoice.payment_failed':
      return handlePaymentFailed(event.data.object, deps);
    case 'invoice.created':
      return upsertInvoiceFromStripe(event.data.object, deps);
    case 'payment_method.attached':
      return { ok: true, event: event.type };
    case 'customer.updated':
      return { ok: true, event: event.type };
    default:
      return { ignored: true, event: event.type };
  }
}

async function handleStripeWebhook(req, res, deps = {}) {
  const signature = req.headers['stripe-signature'];
  const endpointSecret = deps.endpointSecret || process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature) {
    return res.status(400).json({ error: 'Missing Stripe signature' });
  }

  try {
    const event = verifyStripeSignature(req.body, signature, endpointSecret);
    const storedEvent = await recordStripeWebhookEvent(event, deps);
    try {
      await handleStripeEvent(event, deps);
      if (storedEvent) {
        await markStripeWebhookEventProcessed(storedEvent, deps);
      }
      await recordStripeWebhookAudit(event, 'processed', deps);
    } catch (processingError) {
      if (storedEvent) {
        await markStripeWebhookEventFailed(storedEvent, processingError, deps);
      }
      await recordStripeWebhookAudit(event, 'failed', deps, processingError);
      console.error('[Stripe webhook] Processing error:', processingError.message);
    }
    return res.status(200).json({ received: true });
  } catch (error) {
    try {
      const rawEvent = typeof req.body === 'string' || Buffer.isBuffer(req.body) ? null : req.body;
      if (rawEvent) {
        await recordStripeWebhookAudit(rawEvent, 'failed', deps, error);
      }
    } catch (auditError) {
      console.error('[Stripe webhook] Audit error:', auditError.message);
    }
    console.error('[Stripe webhook] Error:', error.message);
    return res.status(400).json({ error: error.message });
  }
}

module.exports = {
  verifyStripeSignature,
  recordStripeWebhookAudit,
  handleStripeEvent,
  handleStripeWebhook,
};
