const express = require('express');
const { requireTenant } = require('../tenancy/tenantMiddleware');
const { permissionMiddleware } = require('../auth/permissions');
const {
  createApiKey,
  revokeApiKey,
  listApiKeysForOrganization,
} = require('../apiKeys/apiKeyService');

const router = express.Router();

router.get('/', requireTenant, permissionMiddleware('billing.manage'), async (req, res) => {
  try {
    const keys = await listApiKeysForOrganization({
      organizationId: req.organization.id,
      prisma: req.prisma,
    });
    return res.json({ keys });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.post('/', requireTenant, permissionMiddleware('billing.manage'), async (req, res) => {
  try {
    const result = await createApiKey({
      organizationId: req.organization.id,
      organization: req.organization,
      name: req.body.name,
      createdBy: req.auth.userId,
      prisma: req.prisma,
    });
    return res.json(result);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.post('/:apiKeyId/revoke', requireTenant, permissionMiddleware('billing.manage'), async (req, res) => {
  try {
    const result = await revokeApiKey({
      apiKeyId: req.params.apiKeyId,
      organizationId: req.organization.id,
      revokedBy: req.auth.userId,
      prisma: req.prisma,
    });
    return res.json(result);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
});

module.exports = router;
