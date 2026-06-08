const {
  recordStripeWebhookEvent,
  retryPendingStripeWebhookEvents,
  enforceBillingLifecycle,
  expireScheduledSubscriptions,
} = require('../../src/billing/billingLifecycleService');

describe('billing lifecycle service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('pauses campaigns after three payment failures', async () => {
    const prisma = {
      organization: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'org_1',
            subscription_status: 'past_due',
          },
        ]),
        update: jest.fn().mockResolvedValue({ id: 'org_1' }),
      },
      auditLog: {
        count: jest.fn().mockResolvedValue(3),
        findFirst: jest.fn().mockResolvedValue({
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        }),
        create: jest.fn().mockResolvedValue({ id: 'audit_1' }),
      },
      campaign: {
        updateMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
      subscription: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };

    const result = await enforceBillingLifecycle({ prisma, now: new Date() });

    expect(result.paused).toBe(1);
    expect(prisma.campaign.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ organization_id: 'org_1' }),
      data: expect.objectContaining({ status: 'paused' }),
    }));
  });

  it('cancels a past_due subscription after seven days', async () => {
    const prisma = {
      organization: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'org_1',
            subscription_status: 'past_due',
          },
        ]),
        update: jest.fn().mockResolvedValue({ id: 'org_1' }),
      },
      auditLog: {
        count: jest.fn().mockResolvedValue(4),
        findFirst: jest.fn().mockResolvedValue({
          created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        }),
        create: jest.fn().mockResolvedValue({ id: 'audit_1' }),
      },
      campaign: {
        updateMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
      subscription: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };

    const result = await enforceBillingLifecycle({ prisma, now: new Date() });

    expect(result.canceled).toBe(1);
    expect(prisma.organization.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'org_1' },
      data: expect.objectContaining({ subscription_status: 'canceled' }),
    }));
  });

  it('marks webhook events processed after a retry succeeds', async () => {
    const prisma = {
      stripeWebhookEvent: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'evt_row_1',
            stripe_event_id: 'evt_1',
            event_type: 'invoice.payment_failed',
            payload: {
              id: 'evt_1',
              type: 'invoice.payment_failed',
              data: { object: { id: 'in_1', subscription: 'sub_1', metadata: { org_id: 'org_1' } } },
            },
            attempt_count: 1,
          },
        ]),
        update: jest.fn().mockResolvedValue({ id: 'evt_row_1' }),
      },
    };

    const handleStripeEvent = jest.fn().mockResolvedValue({ ok: true });

    const result = await retryPendingStripeWebhookEvents({ prisma, handleStripeEvent, now: new Date() });

    expect(result.processed).toBe(1);
    expect(handleStripeEvent).toHaveBeenCalledWith(expect.objectContaining({ type: 'invoice.payment_failed' }), expect.any(Object));
    expect(prisma.stripeWebhookEvent.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'evt_row_1' },
      data: expect.objectContaining({ status: 'processed' }),
    }));
  });

  it('records a webhook event in pending state', async () => {
    const prisma = {
      stripeWebhookEvent: {
        upsert: jest.fn().mockResolvedValue({ id: 'evt_row_1' }),
      },
    };

    const result = await recordStripeWebhookEvent({
      id: 'evt_1',
      type: 'customer.subscription.created',
      data: { object: { id: 'sub_1', metadata: { org_id: 'org_1' } } },
    }, { prisma });

    expect(result.id).toBe('evt_row_1');
    expect(prisma.stripeWebhookEvent.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { stripe_event_id: 'evt_1' },
      update: expect.objectContaining({ status: 'pending' }),
      create: expect.objectContaining({ status: 'pending' }),
    }));
  });

  it('expires scheduled cancellations when the billing period ends', async () => {
    const prisma = {
      subscription: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'sub_1',
            organization_id: 'org_1',
            stripe_subscription_id: 'sub_1',
            status: 'active',
            cancel_at_period_end: true,
            current_period_end: new Date(Date.now() - 60 * 1000),
            organization: {
              id: 'org_1',
              name: 'Acme',
              billing_email: 'billing@acme.co',
            },
          },
        ]),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        update: jest.fn().mockResolvedValue({ id: 'sub_1' }),
      },
      organization: {
        update: jest.fn().mockResolvedValue({ id: 'org_1' }),
      },
      campaign: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'audit_1' }),
      },
    };

    const result = await expireScheduledSubscriptions({ prisma, now: new Date() });

    expect(result.canceled).toBe(1);
    expect(prisma.subscription.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'sub_1' },
      data: expect.objectContaining({ status: 'canceled' }),
    }));
  });
});
