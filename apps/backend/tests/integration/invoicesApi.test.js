jest.mock('../../src/auth/clerkClient', () => ({
  authenticateRequest: jest.fn().mockResolvedValue({ userId: 'user_1', sessionId: 'sess_1' }),
}));

jest.mock('../../src/tenancy/tenantContext', () => ({
  loadTenantContext: jest.fn().mockResolvedValue({
    member: { role: 'OWNER', status: 'active', name: 'Owner User' },
    organization: { id: 'org_1', subscription_status: 'active', name: 'Acme', billing_email: 'billing@acme.co' },
  }),
}));

jest.mock('../../src/data/prisma', () => ({
  getPrisma: () => ({
    invoice: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'inv_1',
          stripe_invoice_id: 'in_1',
          amount_paid: 2500,
          status: 'paid',
        },
      ]),
    },
  }),
}));

const router = require('../../src/api/billing/invoices');

describe('billing invoices API', () => {
  it('returns the invoice history for the tenant', async () => {
    const handler = router.stack[0].route.stack[1].handle;
    const res = {
      statusCode: 200,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        return this;
      },
    };

    const req = {
      organization: { id: 'org_1' },
    };

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.invoices).toHaveLength(1);
    expect(res.body.invoices[0].stripe_invoice_id).toBe('in_1');
  });
});
