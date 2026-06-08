const express = require('express');
const { handleStripeWebhook } = require('../../billing/stripeWebhooks');

const router = express.Router();

router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  return handleStripeWebhook(req, res);
});

module.exports = router;
