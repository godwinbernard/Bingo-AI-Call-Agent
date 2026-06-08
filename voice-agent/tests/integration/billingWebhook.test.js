jest.mock('../../src/billing/subscriptionService', () => ({
  handleSubscriptionCreated: jest.fn().mockResolvedValue({ ok: true }),
  handleSubscriptionUpdated: jest.fn().mockResolvedValue({ ok: true }),
  handleSubscriptionCanceled: jest.fn().mockResolvedValue({ ok: true }),
  handlePaymentFailed: jest.fn().mockResolvedValue({ ok: true }),
  handleInvoicePaid: jest.fn().mockResolvedValue({ ok: true }),
}));

jest.mock('../../src/billing/invoiceService', () => ({
  upsertInvoiceFromStripe: jest.fn().mockResolvedValue({ ok: true }),
}));

jest.mock('../../src/billing/stripeClient', () => ({
  getStripe: () => ({
    webhooks: {
      constructEvent: jest.fn((rawBody, signature, secret) => {
        if (signature !== 'valid') {
          throw new Error('bad signature');
        }
        return JSON.parse(rawBody.toString());
      }),
    },
  }),
}));

const { handleStripeEvent, verifyStripeSignature } = require('../../src/billing/stripeWebhooks');

describe('billing webhook', () => {
  it('verifies stripe signatures', () => {
    expect(() => verifyStripeSignature(Buffer.from(JSON.stringify({ type: 'customer.subscription.created', data: { object: {} } })), 'valid', 'secret')).not.toThrow();
  });

  it('dispatches subscription events', async () => {
    const event = {
      type: 'customer.subscription.created',
      data: { object: { id: 'sub_1', metadata: { org_id: 'org_1' } } },
    };

    const result = await handleStripeEvent(event, {});
    expect(result.ok).toBe(true);
  });
});
