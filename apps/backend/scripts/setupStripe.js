const { getStripe, PLAN_CATALOG } = require('../src/billing/stripeClient');

async function ensureProductAndPrice(stripe, plan, billingCycle = 'month', discount = 0) {
  const product = await stripe.products.create({
    name: `${plan.tier} Plan`,
    metadata: {
      tier: plan.tier,
      billing_cycle: billingCycle,
    },
  });

  const price = await stripe.prices.create({
    product: product.id,
    currency: 'usd',
    unit_amount: Math.round(plan.monthly * 100 * (billingCycle === 'year' ? 12 * (1 - discount) : 1)),
    recurring: { interval: billingCycle },
    metadata: { tier: plan.tier, billing_cycle: billingCycle },
  });

  return { product, price };
}

async function main() {
  const stripe = getStripe();
  const results = [];

  for (const tier of ['STARTER', 'GROWTH', 'ENTERPRISE']) {
    const plan = PLAN_CATALOG[tier];
    results.push({ tier, monthly: await ensureProductAndPrice(stripe, plan, 'month') });
    results.push({ tier, annual: await ensureProductAndPrice(stripe, plan, 'year', 0.2) });
  }

  const paygProduct = await stripe.products.create({
    name: 'PAYG Plan',
    metadata: { tier: 'PAY_AS_YOU_GO' },
  });
  const paygPrice = await stripe.prices.create({
    product: paygProduct.id,
    currency: 'usd',
    unit_amount: 8,
    recurring: { interval: 'month', usage_type: 'metered' },
    metadata: { tier: 'PAY_AS_YOU_GO' },
  });

  const portal = await stripe.billingPortal.configurations.create({
    business_profile: {
      headline: 'VoiceAgent billing',
    },
    features: {
      customer_update: { enabled: true, allowed_updates: ['email', 'tax_id', 'address'] },
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      subscription_cancel: { enabled: true },
      subscription_update: { enabled: true },
    },
  });

  const webhookEndpoint = await stripe.webhookEndpoints.create({
    url: `${process.env.BASE_URL || 'http://localhost:3000'}/api/billing/webhook`,
    enabled_events: [
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'customer.subscription.trial_will_end',
      'invoice.payment_succeeded',
      'invoice.payment_failed',
      'invoice.created',
      'payment_method.attached',
      'customer.updated',
    ],
  });

  console.log(JSON.stringify({
    starterMonthly: results.find((entry) => entry.tier === 'STARTER' && entry.monthly)?.monthly?.price?.id,
    growthMonthly: results.find((entry) => entry.tier === 'GROWTH' && entry.monthly)?.monthly?.price?.id,
    enterpriseMonthly: results.find((entry) => entry.tier === 'ENTERPRISE' && entry.monthly)?.monthly?.price?.id,
    paygPrice: paygPrice.id,
    portalConfiguration: portal.id,
    webhookEndpoint: webhookEndpoint.id,
  }, null, 2));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
