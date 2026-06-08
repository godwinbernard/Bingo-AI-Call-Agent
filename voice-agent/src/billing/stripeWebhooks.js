const { getStripe } = require('./stripeClient');
const {
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionCanceled,
  handlePaymentFailed,
  handleInvoicePaid,
} = require('./subscriptionService');
const { upsertInvoiceFromStripe } = require('./invoiceService');

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

async function handleStripeEvent(event, deps = {}) {
  switch (event.type) {
    case 'customer.subscription.created':
      return handleSubscriptionCreated(event.data.object, deps);
    case 'customer.subscription.updated':
      return handleSubscriptionUpdated(event.data.object, deps);
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
    await handleStripeEvent(event, deps);
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('[Stripe webhook] Error:', error.message);
    return res.status(400).json({ error: error.message });
  }
}

module.exports = {
  verifyStripeSignature,
  handleStripeEvent,
  handleStripeWebhook,
};
