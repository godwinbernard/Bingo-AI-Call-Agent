const Stripe = require('stripe');

const PLAN_CATALOG = {
  STARTER: {
    tier: 'STARTER',
    monthly: 99,
    calls_per_month: 500,
    max_campaigns: 2,
    max_scripts: 3,
    max_team_members: 1,
    custom_voice: false,
    api_access: false,
    crm_integrations: false,
    support_level: 'email',
  },
  GROWTH: {
    tier: 'GROWTH',
    monthly: 299,
    calls_per_month: 2000,
    max_campaigns: 'unlimited',
    max_scripts: 'unlimited',
    max_team_members: 5,
    custom_voice: true,
    api_access: true,
    crm_integrations: true,
    support_level: 'priority',
  },
  ENTERPRISE: {
    tier: 'ENTERPRISE',
    monthly: 999,
    calls_per_month: 'unlimited',
    max_campaigns: 'unlimited',
    max_scripts: 'unlimited',
    max_team_members: 'unlimited',
    custom_voice: true,
    api_access: true,
    crm_integrations: true,
    white_label: true,
    sso: true,
    audit_logs: true,
    sla: '99.9%',
    support_level: 'dedicated',
  },
  PAY_AS_YOU_GO: {
    tier: 'PAY_AS_YOU_GO',
    monthly: 0,
    calls_per_month: 0,
    price_per_minute: 0.08,
    max_campaigns: 1,
    max_scripts: 1,
    max_team_members: 1,
  },
};

let stripeInstance = null;

function getStripe() {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
    });
  }
  return stripeInstance;
}

function getPriceIdForTier(tier, billingCycle = 'month') {
  if (tier === 'STARTER') return billingCycle === 'year' ? process.env.STRIPE_STARTER_ANNUAL_PRICE_ID || process.env.STRIPE_STARTER_PRICE_ID : process.env.STRIPE_STARTER_PRICE_ID;
  if (tier === 'GROWTH') return billingCycle === 'year' ? process.env.STRIPE_GROWTH_ANNUAL_PRICE_ID || process.env.STRIPE_GROWTH_PRICE_ID : process.env.STRIPE_GROWTH_PRICE_ID;
  if (tier === 'ENTERPRISE') return billingCycle === 'year' ? process.env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID || process.env.STRIPE_ENTERPRISE_PRICE_ID : process.env.STRIPE_ENTERPRISE_PRICE_ID;
  if (tier === 'PAY_AS_YOU_GO') return process.env.STRIPE_PAYG_PRICE_ID;
  throw new Error(`Unknown tier: ${tier}`);
}

function tierFromPriceId(priceId) {
  return Object.values(PLAN_CATALOG).find((plan) => {
    const monthly = getPriceIdForTier(plan.tier, 'month');
    const yearly = getPriceIdForTier(plan.tier, 'year');
    return priceId === monthly || priceId === yearly;
  })?.tier || null;
}

module.exports = {
  getStripe,
  PLAN_CATALOG,
  getPriceIdForTier,
  tierFromPriceId,
};
