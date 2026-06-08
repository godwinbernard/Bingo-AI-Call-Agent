const express = require('express');
const { requireTenant } = require('../../tenancy/tenantMiddleware');
const { permissionMiddleware } = require('../../auth/permissions');
const { getPrisma } = require('../../data/prisma');

const router = express.Router();

router.patch('/:memberId', requireTenant, permissionMiddleware('member.manage'), async (req, res) => {
  const prisma = getPrisma();
  const { role } = req.body;
  const result = await prisma.organizationMember.updateMany({
    where: { id: req.params.memberId, organization_id: req.organization.id },
    data: { role },
  });
  return res.json({ success: result.count > 0 });
});

module.exports = router;
