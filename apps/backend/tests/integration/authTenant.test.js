jest.mock('../../src/auth/clerkClient', () => ({
  authenticateRequest: jest.fn().mockResolvedValue({ userId: 'user_1', sessionId: 'sess_1' }),
}));

jest.mock('../../src/tenancy/tenantContext', () => ({
  loadTenantContext: jest.fn().mockResolvedValue({
    member: { role: 'VIEWER', status: 'active', name: 'Viewer User' },
    organization: { id: 'org_1', subscription_status: 'active', name: 'Acme', billing_email: 'billing@acme.co' },
  }),
}));

const { requireTenant } = require('../../src/tenancy/tenantMiddleware');

describe('auth and tenancy middleware', () => {
  it('attaches tenant context for active members', async () => {
    const req = { headers: { authorization: 'Bearer token' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await requireTenant(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.organization.id).toBe('org_1');
  });
});
