const express = require('express');
const { requireAuth } = require('../../auth/middleware');
const { requireTenant } = require('../../tenancy/tenantMiddleware');
const { createSession, endSession } = require('../../services/dialer/sessionService');

const router = express.Router();

router.post('/', requireAuth, requireTenant, async (req, res) => {
  const session = await createSession(req.member.id, req.organization.id, req.body?.campaignId || null, req.body?.twilioDevice || null);
  res.status(201).json({ session });
});

router.delete('/', requireAuth, requireTenant, async (req, res) => {
  const sessionId = req.body?.sessionId || req.query?.sessionId;
  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  const summary = await endSession(sessionId);
  res.json({ summary });
});

module.exports = router;
