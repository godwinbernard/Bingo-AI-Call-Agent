const express = require('express');
const { requireTenant } = require('../../tenancy/tenantMiddleware');
const { permissionMiddleware } = require('../../auth/permissions');
const {
  createInvitation,
  acceptInvitation,
  revokeInvitation,
  expirePendingInvitations,
  listInvitations,
} = require('../../team/invitationService');

const router = express.Router();

router.get('/', requireTenant, async (req, res) => {
  try {
    const invitations = await listInvitations({
      organizationId: req.organization.id,
      prisma: req.prisma,
    });
    return res.json({ invitations });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
});

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
      acceptBaseUrl: req.body.acceptBaseUrl,
      sendEmail: req.body.sendEmail !== false,
    });
    return res.json(invitation);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.post('/accept', async (req, res) => {
  try {
    const result = await acceptInvitation({
      prisma: req.prisma,
      token: req.body.token,
      user: {
        userId: req.body.userId,
        email: req.body.email,
        name: req.body.name,
      },
    });
    return res.json(result);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.post('/:invitationId/revoke', requireTenant, permissionMiddleware('member.manage'), async (req, res) => {
  try {
    const result = await revokeInvitation({
      prisma: req.prisma,
      invitationId: req.params.invitationId,
      organizationId: req.organization.id,
      revokedBy: req.auth.userId,
    });
    return res.json(result);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.post('/expire', async (req, res) => {
  try {
    const result = await expirePendingInvitations({
      prisma: req.prisma,
      now: req.body.now ? new Date(req.body.now) : new Date(),
    });
    return res.json(result);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
});

module.exports = router;
