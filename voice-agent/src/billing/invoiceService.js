const { getPrisma } = require('../data/prisma');

async function upsertInvoiceFromStripe(invoice, deps = {}) {
  const prisma = deps.prisma || getPrisma();

  return prisma.invoice.upsert({
    where: { stripe_invoice_id: invoice.id },
    update: {
      amount_paid: invoice.amount_paid || 0,
      amount_due: invoice.amount_due || 0,
      currency: invoice.currency || 'usd',
      status: invoice.status || 'open',
      invoice_url: invoice.hosted_invoice_url || null,
      invoice_pdf: invoice.invoice_pdf || null,
      period_start: new Date((invoice.period_start || Date.now() / 1000) * 1000),
      period_end: new Date((invoice.period_end || Date.now() / 1000) * 1000),
      paid_at: invoice.status_transitions?.paid_at ? new Date(invoice.status_transitions.paid_at * 1000) : null,
    },
    create: {
      organization_id: invoice.metadata?.org_id,
      stripe_invoice_id: invoice.id,
      amount_paid: invoice.amount_paid || 0,
      amount_due: invoice.amount_due || 0,
      currency: invoice.currency || 'usd',
      status: invoice.status || 'open',
      invoice_url: invoice.hosted_invoice_url || null,
      invoice_pdf: invoice.invoice_pdf || null,
      period_start: new Date((invoice.period_start || Date.now() / 1000) * 1000),
      period_end: new Date((invoice.period_end || Date.now() / 1000) * 1000),
      paid_at: invoice.status_transitions?.paid_at ? new Date(invoice.status_transitions.paid_at * 1000) : null,
    },
  });
}

async function listInvoicesForOrganization(organizationId, deps = {}) {
  const prisma = deps.prisma || getPrisma();
  return prisma.invoice.findMany({
    where: { organization_id: organizationId },
    orderBy: { created_at: 'desc' },
  });
}

module.exports = { upsertInvoiceFromStripe, listInvoicesForOrganization };
