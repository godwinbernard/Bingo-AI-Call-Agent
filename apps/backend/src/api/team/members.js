const express = require('express');
const { requireTenant } = require('../../tenancy/tenantMiddleware');
const { permissionMiddleware } = require('../../auth/permissions');
const { getPrisma } = require('../../data/prisma');

const router = express.Router();

router.get('/', requireTenant, async (req, res) => {
  const prisma = getPrisma();
  const members = await prisma.organizationMember.findMany({
    where: { organization_id: req.organization.id },
    orderBy: { created_at: 'asc' },
  });
  return res.json({ members });
});

router.delete('/:memberId', requireTenant, permissionMiddleware('member.manage'), async (req, res) => {
  const prisma = getPrisma();
  const result = await prisma.organizationMember.deleteMany({
    where: { id: req.params.memberId, organization_id: req.organization.id },
  });
  return res.json({ success: result.count > 0 });
});

module.exports = router;
