jest.mock('../../src/billing/stripeClient', () => ({
  getStripe: () => ({
    customers: {
      retrieve: jest.fn().mockResolvedValue({ id: 'cus_1' }),
      create: jest.fn().mockResolvedValue({ id: 'cus_1' }),
    },
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({ id: 'cs_1', url: 'https://stripe.test/checkout/cs_1' }),
      },
    },
    billingPortal: {
      sessions: {
        create: jest.fn().mockResolvedValue({ id: 'bps_1', url: 'https://stripe.test/portal/bps_1' }),
      },
    },
  }),
  getPriceIdForTier: () => 'price_test',
  tierFromPriceId: () => 'GROWTH',
}));

jest.mock('../../src/data/prisma', () => ({
  getPrisma: () => ({
    organization: {
      update: jest.fn().mockResolvedValue({ id: 'org_1', billing_email: 'billing@acme.co', name: 'Acme', slug: 'acme' }),
    },
    subscription: {
      upsert: jest.fn().mockResolvedValue({ id: 'sub_1' }),
      findUnique: jest.fn().mockResolvedValue(null),
    },
    invoice: {
      upsert: jest.fn().mockResolvedValue({ id: 'inv_1' }),
      findMany: jest.fn().mockResolvedValue([]),
    },
  }),
}));

const { createCheckoutSession } = require('../../src/billing/subscriptionService');

describe('checkout session', () => {
  it('creates a session with metadata', async () => {
    const session = await createCheckoutSession(
      { id: 'org_1', billing_email: 'billing@acme.co', name: 'Acme', slug: 'acme' },
      'GROWTH',
      'https://app.local/success',
      'https://app.local/cancel'
    );

    expect(session.url).toContain('stripe.test');
  });
});
