export const PLAN_ORDER = ['STARTER', 'GROWTH', 'ENTERPRISE', 'PAY_AS_YOU_GO'];

export const PLAN_LABELS = {
  STARTER: 'Starter',
  GROWTH: 'Growth',
  ENTERPRISE: 'Enterprise',
  PAY_AS_YOU_GO: 'Pay As You Go',
};

export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount / 100);
}
