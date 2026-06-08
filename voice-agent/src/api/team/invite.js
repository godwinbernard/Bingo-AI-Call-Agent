const express = require('express');
const crypto = require('crypto');
const { requireTenant } = require('../../tenancy/tenantMiddleware');
const { permissionMiddleware } = require('../../auth/permissions');
const { getPrisma } = require('../../data/prisma');
const { sendInviteEmail } = require('../../billing/subscriptionService');

const router = express.Router();

router.post('/', requireTenant, permissionMiddleware('member.manage'), async (req, res) => {
  try {
    const prisma = getPrisma();
    const { email, role, inviterName, acceptBaseUrl } = req.body;
    const token = crypto.randomBytes(24).toString('hex');
    const invitation = await prisma.invitation.create({
      data: {
        organization_id: req.organization.id,
        email,
        role,
        token,
        invited_by: req.auth.userId,
        expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000),
      },
    });

    await sendInviteEmail({
      inviterName: inviterName || req.member.name,
      companyName: req.organization.name,
      role,
      acceptUrl: `${acceptBaseUrl || process.env.BASE_URL || 'http://localhost:3001'}/onboarding?token=${token}`,
      to: email,
    });

    await prisma.auditLog.create({
      data: {
        organization_id: req.organization.id,
        user_id: req.auth.userId,
        action: 'invite_sent',
        resource_type: 'invitation',
        resource_id: invitation.id,
        metadata: { email, role },
      },
    });

    return res.json({ invitation });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
