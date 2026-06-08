const express = require('express');
const { requireTenant } = require('../../tenancy/tenantMiddleware');
const { permissionMiddleware } = require('../../auth/permissions');
const { createInvitation } = require('../../team/invitationService');

const router = express.Router();

router.post('/', requireTenant, permissionMiddleware('member.manage'), async (req, res) => {
  try {
    const invitation = await createInvitation({
      prisma: req.prisma,
      organization: req.organization,
      inviter: {
        userId: req.auth.userId,
        name: req.member?.name || req.auth.userId,
      },
      email: req.body.email,
      role: req.body.role,
      acceptBaseUrl: req.body.acceptBaseUrl || process.env.BASE_URL || 'http://localhost:3001',
      sendEmail: req.body.sendEmail !== false,
    });
    return res.json({ invitation });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
