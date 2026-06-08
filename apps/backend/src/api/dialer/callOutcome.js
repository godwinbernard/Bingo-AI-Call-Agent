const express = require('express');
const { requireAuth } = require('../../auth/middleware');
const { requireTenant } = require('../../tenancy/tenantMiddleware');
const { logOutcome } = require('../../services/dialer/callLogService');

const router = express.Router();

router.post('/:id/outcome', requireAuth, requireTenant, async (req, res) => {
  const { outcome, notes } = req.body || {};
  if (!outcome) {
    return res.status(400).json({ error: 'outcome is required' });
  }

  const result = await logOutcome(req.params.id, outcome, notes);
  res.json({ success: true, scorecardId: result.scorecard?.id || null });
});

module.exports = router;
