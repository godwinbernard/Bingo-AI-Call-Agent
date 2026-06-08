const express = require('express');
const { requireTenant } = require('../../tenancy/tenantMiddleware');
const { checkCallLimit, getUsageSummary, incrementCallUsage } = require('../../billing/usageService');

const router = express.Router();

router.get('/', requireTenant, async (req, res) => {
  try {
    const summary = await getUsageSummary(req.organization.id);
    return res.json(summary);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/increment', requireTenant, async (req, res) => {
  try {
    const { minutes = 0 } = req.body;
    const limit = await checkCallLimit(req.organization.id);
    const result = await incrementCallUsage(req.organization.id, minutes);
    return res.json({ limit, result });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
});

module.exports = router;
