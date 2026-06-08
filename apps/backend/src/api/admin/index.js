const express = require('express');
const { requireAdminSecret } = require('../../auth/middleware');
const {
  buildAdminOverview,
  buildAdminCustomers,
  buildAdminRevenueSummary,
  extendTrialForOrganization,
  changeOrganizationPlan,
  impersonateOrganization,
} = require('../../admin/adminService');

const router = express.Router();

router.use(requireAdminSecret);

router.get('/overview', async (req, res) => {
  try {
    const overview = await buildAdminOverview({ prisma: req.prisma });
    return res.json(overview);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.get('/customers', async (req, res) => {
  try {
    const customers = await buildAdminCustomers({ prisma: req.prisma });
    return res.json({ customers });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.get('/revenue', async (req, res) => {
  try {
    const summary = await buildAdminRevenueSummary({ prisma: req.prisma });
    return res.json(summary);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.post('/customers/:organizationId/extend-trial', async (req, res) => {
  try {
    const result = await extendTrialForOrganization({
      prisma: req.prisma,
      organizationId: req.params.organizationId,
      days: req.body.days || 7,
      userId: req.body.userId || null,
    });
    return res.json(result);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.post('/customers/:organizationId/change-plan', async (req, res) => {
  try {
    const result = await changeOrganizationPlan({
      prisma: req.prisma,
      organizationId: req.params.organizationId,
      tier: req.body.tier,
      billingCycle: req.body.billingCycle || 'month',
      userId: req.body.userId || null,
    });
    return res.json(result);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.post('/customers/:organizationId/impersonate', async (req, res) => {
  try {
    const result = await impersonateOrganization({
      prisma: req.prisma,
      organizationId: req.params.organizationId,
      userId: req.body.userId || null,
      baseUrl: req.body.baseUrl,
    });
    return res.json(result);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
});

module.exports = router;
