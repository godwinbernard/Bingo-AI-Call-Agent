const { checkCallLimit, getUsageSummary, incrementCallUsage } = require('../../src/billing/usageService');

describe('usage service', () => {
  it('blocks calls at the configured limit', async () => {
    await expect(checkCallLimit('org_1', {
      usage: {
        subscription_tier: 'STARTER',
        calls_used_this_month: 500,
      },
    })).rejects.toThrow('429');
  });

  it('returns summary values', async () => {
    const prisma = {
      organization: {
        findUnique: jest.fn().mockResolvedValue({
          subscription_tier: 'STARTER',
          calls_used_this_month: 400,
          usage_reset_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          trial_ends_at: null,
          usage_records: [{ minutes_used: 20 }],
          subscriptions: [],
        }),
      },
    };

    const summary = await getUsageSummary('org_1', { prisma });
    expect(summary.percentage).toBe(80);
    expect(summary.remaining).toBe(100);
  });

  it('allows pay-as-you-go usage without a monthly cap', async () => {
    const result = await checkCallLimit('org_payg', {
      usage: {
        subscription_tier: 'PAY_AS_YOU_GO',
        calls_used_this_month: 999,
      },
    });

    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(0);
    expect(result.remaining).toBe(0);
    expect(result.percentage).toBe(0);
  });

  it('reports pay-as-you-go minutes to stripe', async () => {
    const createUsageRecord = jest.fn().mockResolvedValue({ id: 'ur_1' });
    const stripe = {
      subscriptions: {
        retrieve: jest.fn().mockResolvedValue({
          items: {
            data: [{ id: 'si_1' }],
          },
        }),
      },
      subscriptionItems: {
        createUsageRecord,
      },
    };
    const prisma = {
      organization: {
        update: jest.fn().mockResolvedValue({ id: 'org_1', subscription_tier: 'PAY_AS_YOU_GO' }),
      },
      usageRecord: {
        create: jest.fn().mockResolvedValue({ id: 'usage_1' }),
      },
      subscription: {
        findUnique: jest.fn().mockResolvedValue({
          tier: 'PAY_AS_YOU_GO',
          stripe_subscription_id: 'sub_1',
        }),
      },
    };

    await incrementCallUsage('org_1', 5, { prisma, stripe });

    expect(createUsageRecord).toHaveBeenCalledWith('si_1', expect.objectContaining({
      quantity: 5,
      action: 'increment',
    }));
  });
});
