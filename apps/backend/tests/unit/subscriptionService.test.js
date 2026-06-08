jest.mock('../../src/billing/invoiceService', () => ({
  upsertInvoiceFromStripe: jest.fn().mockResolvedValue({
    id: 'inv_1',
    organization_id: 'org_1',
  }),
}));

jest.mock('../../src/email/resendClient', () => ({
  sendTransactionalEmail: jest.fn().mockResolvedValue({ ok: true }),
}));

jest.mock('../../src/email/templates/invoiceEmail', () => ({
  buildInvoiceEmail: jest.fn().mockReturnValue({
    subject: 'Invoice ready',
    html: '<p>Invoice ready</p>',
  }),
}));

const { handleInvoicePaid, handleSubscriptionUpdated } = require('../../src/billing/subscriptionService');
const { sendTransactionalEmail } = require('../../src/email/resendClient');

describe('subscription service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads organization details before sending an invoice email', async () => {
    const prisma = {
      organization: {
        findUnique: jest.fn().mockResolvedValue({
          name: 'Acme',
          billing_email: 'billing@acme.co',
        }),
      },
    };

    const invoice = {
      id: 'in_1',
      metadata: {
        org_id: 'org_1',
      },
      customer_email: 'billing@acme.co',
      amount_paid: 2500,
      hosted_invoice_url: 'https://stripe.test/invoice/in_1',
      period_start: 1710000000,
      period_end: 1712592000,
    };

    const result = await handleInvoicePaid(invoice, { prisma });

    expect(result.ok).toBe(true);
    expect(prisma.organization.findUnique).toHaveBeenCalledWith({
      where: { id: 'org_1' },
      select: {
        name: true,
        billing_email: true,
      },
    });
    expect(sendTransactionalEmail).toHaveBeenCalledTimes(1);
  });

  it('sends a downgrade notice when the plan moves down', async () => {
    const prisma = {
      organization: {
        update: jest.fn().mockResolvedValue({
          id: 'org_1',
          billing_email: 'billing@acme.co',
          name: 'Acme',
          subscription_tier: 'STARTER',
          subscription_status: 'active',
        }),
      },
      subscription: {
        upsert: jest.fn().mockResolvedValue({ id: 'sub_1' }),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'audit_1' }),
      },
    };

    const result = await handleSubscriptionUpdated(
      {
        id: 'sub_2',
        metadata: { org_id: 'org_1', tier: 'STARTER' },
        status: 'active',
        items: { data: [{ price: { id: 'price_starter' } }] },
        current_period_start: 1710000000,
        current_period_end: 1712592000,
      },
      {
        prisma,
        previousAttributes: { metadata: { tier: 'GROWTH' } },
      }
    );

    expect(result.ok).toBe(true);
    expect(sendTransactionalEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'billing@acme.co',
      subject: 'Your plan will change to STARTER',
    }));
    expect(prisma.auditLog.create).toHaveBeenCalled();
  });
});
