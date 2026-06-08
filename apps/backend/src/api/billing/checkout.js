const express = require('express');
const { requireTenant } = require('../../tenancy/tenantMiddleware');
const { createCheckoutSession } = require('../../billing/subscriptionService');

const router = express.Router();

router.post('/', requireTenant, async (req, res) => {
  try {
    const { tier, successUrl, cancelUrl } = req.body;
    const session = await createCheckoutSession(req.organization, tier, successUrl, cancelUrl);
    return res.json({ url: session.url, session_id: session.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
