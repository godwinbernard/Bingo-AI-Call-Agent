const { createTenantPrisma } = require('../../src/tenancy/tenantIsolation');

describe('tenant isolation', () => {
  it('throws without an organization id', () => {
    expect(() => createTenantPrisma(null, {})).toThrow('organization_id is required');
  });

  it('injects organization_id into queries', async () => {
    const prisma = {
      campaign: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const tenant = createTenantPrisma('org_123', prisma);
    await tenant.campaign.findMany({ where: { status: 'draft' } });

    expect(prisma.campaign.findMany).toHaveBeenCalledWith({
      where: { status: 'draft', organization_id: 'org_123' },
    });
  });
});
