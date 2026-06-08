const { checkCallLimit, getUsageSummary } = require('../../src/billing/usageService');

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
});
