const express = require('express');
const { requireAuth } = require('../../auth/middleware');
const { requireTenant } = require('../../tenancy/tenantMiddleware');
const { generateAccessToken } = require('../../services/dialer/twilioVoiceService');

const router = express.Router();

router.get('/', requireAuth, requireTenant, async (req, res) => {
  const identity = `${req.organization.id}:${req.member.id}`;
  const token = generateAccessToken(req.member.id, req.organization.id);
  res.json({ token, identity });
});

module.exports = router;
