const {
  buildAdminOverview,
  buildAdminCustomers,
  buildAdminRevenueSummary,
  extendTrialForOrganization,
  changeOrganizationPlan,
  impersonateOrganization,
} = require('../../src/admin/adminService');

describe('admin service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds overview metrics from organizations', async () => {
    const prisma = {
      organization: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'org_1', subscription_tier: 'GROWTH', subscription_status: 'active', calls_used_this_month: 200, created_at: new Date() },
        ]),
        count: jest.fn().mockResolvedValue(1),
      },
      call: {
        count: jest.fn().mockResolvedValue(12),
      },
      subscription: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const overview = await buildAdminOverview({ prisma });

    expect(overview.totalOrganizations).toBe(1);
    expect(overview.mrr).toBe(29900);
  });

  it('builds customer rows', async () => {
    const prisma = {
      organization: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'org_1',
            name: 'Acme',
            subscription_tier: 'GROWTH',
            subscription_status: 'active',
            calls_used_this_month: 200,
            usage_reset_date: new Date(),
            created_at: new Date('2026-01-01T00:00:00Z'),
            trial_ends_at: null,
          },
        ]),
      },
    };

    const customers = await buildAdminCustomers({ prisma });
    expect(customers).toHaveLength(1);
    expect(customers[0].name).toBe('Acme');
  });

  it('builds revenue summary', async () => {
    const prisma = {
      organization: {
        findMany: jest.fn().mockResolvedValue([
          { subscription_tier: 'GROWTH', subscription_status: 'active' },
          { subscription_tier: 'STARTER', subscription_status: 'trialing' },
        ]),
      },
    };

    const summary = await buildAdminRevenueSummary({ prisma });
    expect(summary.activeOrganizations).toBe(1);
    expect(summary.trialOrganizations).toBe(1);
  });

  it('extends a trial', async () => {
    const prisma = {
      organization: {
        update: jest.fn().mockResolvedValue({ id: 'org_1' }),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'audit_1' }),
      },
    };

    const result = await extendTrialForOrganization({ prisma, organizationId: 'org_1', days: 14, userId: 'user_1' });

    expect(result.extended).toBe(true);
    expect(prisma.organization.update).toHaveBeenCalled();
  });

  it('changes a plan', async () => {
    const prisma = {
      organization: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'org_1',
          subscription_tier: 'STARTER',
          stripe_subscription_id: 'sub_1',
        }),
        update: jest.fn().mockResolvedValue({ id: 'org_1' }),
      },
      subscription: {
        update: jest.fn().mockResolvedValue({ id: 'sub_1' }),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'audit_1' }),
      },
    };

    const result = await changeOrganizationPlan({ prisma, organizationId: 'org_1', tier: 'GROWTH', userId: 'user_1' });

    expect(result.changed).toBe(true);
    expect(prisma.organization.update).toHaveBeenCalled();
  });

  it('creates an impersonation token', async () => {
    const prisma = {
      organization: {
        findUnique: jest.fn().mockResolvedValue({ id: 'org_1', name: 'Acme' }),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'audit_1' }),
      },
    };

    const result = await impersonateOrganization({ prisma, organizationId: 'org_1', userId: 'user_1' });

    expect(result.impersonation_token).toBeTruthy();
    expect(prisma.auditLog.create).toHaveBeenCalled();
  });
});
