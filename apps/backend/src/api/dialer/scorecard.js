const express = require('express');
const { requireAuth } = require('../../auth/middleware');
const { requireTenant } = require('../../tenancy/tenantMiddleware');
const { getPrisma } = require('../../data/prisma');
const { generateScorecard } = require('../../services/ai/scorecardGenerator');

const router = express.Router();

router.get('/:callId', requireAuth, requireTenant, async (req, res) => {
  const prisma = getPrisma();
  const scorecard = await prisma.callScorecard.findFirst({
    where: {
      call_id: req.params.callId,
      org_id: req.organization.id,
    },
  });

  if (!scorecard) {
    return res.status(404).json({ error: 'Scorecard not found' });
  }

  res.json({ scorecard });
});

router.post('/:callId', requireAuth, requireTenant, async (req, res) => {
  const scorecard = await generateScorecard(req.params.callId);
  res.json({ scorecard });
});

module.exports = router;
