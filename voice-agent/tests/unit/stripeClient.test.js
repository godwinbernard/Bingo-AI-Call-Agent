describe('stripe client', () => {
  afterEach(() => {
    jest.resetModules();
  });

  it('maps tiers to price IDs', () => {
    process.env.STRIPE_STARTER_PRICE_ID = 'price_starter';
    process.env.STRIPE_GROWTH_PRICE_ID = 'price_growth';
    process.env.STRIPE_ENTERPRISE_PRICE_ID = 'price_enterprise';
    process.env.STRIPE_PAYG_PRICE_ID = 'price_payg';

    const { getPriceIdForTier } = require('../../src/billing/stripeClient');
    expect(getPriceIdForTier('GROWTH')).toBe('price_growth');
    expect(getPriceIdForTier('PAY_AS_YOU_GO')).toBe('price_payg');
  });
});
