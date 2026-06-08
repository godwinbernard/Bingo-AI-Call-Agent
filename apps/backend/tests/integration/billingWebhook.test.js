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

const { handleStripeEvent, handleStripeWebhook, verifyStripeSignature } = require('../../src/billing/stripeWebhooks');

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

  it('records processed webhook events', async () => {
    const req = {
      body: Buffer.from(JSON.stringify({
        id: 'evt_1',
        type: 'customer.subscription.created',
        data: { object: { id: 'sub_1', metadata: { org_id: 'org_1' } } },
      })),
      headers: {
        'stripe-signature': 'valid',
      },
    };
    const res = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        return this;
      },
    };
    const prisma = {
      stripeWebhookEvent: {
        upsert: jest.fn().mockResolvedValue({ id: 'evt_row_1', attempt_count: 0 }),
        update: jest.fn().mockResolvedValue({ id: 'evt_row_1' }),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'audit_1' }),
      },
    };

    await handleStripeWebhook(req, res, { prisma, endpointSecret: 'secret' });

    expect(res.statusCode).toBe(200);
    expect(prisma.auditLog.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        organization_id: 'org_1',
        action: 'stripe_webhook_received',
      }),
    }));
  });
});
