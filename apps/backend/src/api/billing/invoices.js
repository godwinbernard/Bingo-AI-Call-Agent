const express = require('express');
const { requireTenant } = require('../../tenancy/tenantMiddleware');
const { listInvoicesForOrganization } = require('../../billing/invoiceService');

const router = express.Router();

router.get('/', requireTenant, async (req, res) => {
  try {
    const invoices = await listInvoicesForOrganization(req.organization.id);
    return res.json({ invoices });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
