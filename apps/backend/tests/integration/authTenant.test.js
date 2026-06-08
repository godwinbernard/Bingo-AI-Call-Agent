jest.mock('../../src/auth/clerkClient', () => ({
  authenticateRequest: jest.fn().mockResolvedValue({ userId: 'user_1', sessionId: 'sess_1' }),
}));

jest.mock('../../src/tenancy/tenantContext', () => ({
  loadTenantContext: jest.fn().mockResolvedValue({
    member: { role: 'VIEWER', status: 'active', name: 'Viewer User' },
    organization: { id: 'org_1', subscription_status: 'active', name: 'Acme', billing_email: 'billing@acme.co' },
  }),
}));

const { requireTenant, requireBillingMutationAccess } = require('../../src/tenancy/tenantMiddleware');
const { loadTenantContext } = require('../../src/tenancy/tenantContext');

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

  it('allows past_due members to load tenant context', async () => {
    loadTenantContext.mockResolvedValueOnce({
      member: { role: 'VIEWER', status: 'active', name: 'Viewer User' },
      organization: { id: 'org_1', subscription_status: 'past_due', name: 'Acme', billing_email: 'billing@acme.co' },
    });

    const req = { headers: { authorization: 'Bearer token' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await requireTenant(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.organization.subscription_status).toBe('past_due');
  });

  it('blocks paid mutations for past_due organizations', async () => {
    const req = {
      organization: { id: 'org_1', subscription_status: 'past_due' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await requireBillingMutationAccess(req, res, next);

    expect(res.status).toHaveBeenCalledWith(402);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('past_due') }));
    expect(next).not.toHaveBeenCalled();
  });
});
