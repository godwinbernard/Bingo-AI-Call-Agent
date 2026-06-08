const express = require('express');
const { requireTenant } = require('../../tenancy/tenantMiddleware');
const { createBillingPortalSession } = require('../../billing/subscriptionService');

const router = express.Router();

router.post('/', requireTenant, async (req, res) => {
  try {
    const { returnUrl } = req.body;
    const session = await createBillingPortalSession(req.organization, returnUrl);
    return res.json({ url: session.url, session_id: session.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
