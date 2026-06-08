const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { getPrisma } = require('../data/prisma');
const { enforceApiKeyRateLimit } = require('./apiKeyRateLimiter');

function generateRawApiKey() {
  return `va_live_${crypto.randomBytes(12).toString('hex')}`;
}

function getApiKeyPrefix(rawKey) {
  return rawKey.slice(0, 12);
}

async function createApiKey(deps = {}) {
  const prisma = deps.prisma || getPrisma();
  const rawKey = deps.rawKey || generateRawApiKey();
  const prefix = getApiKeyPrefix(rawKey);
  const hash = deps.hashFn ? await deps.hashFn(rawKey) : await bcrypt.hash(rawKey, 12);
  const organization = deps.organization || (deps.organizationId && typeof prisma.organization?.findUnique === 'function'
    ? await prisma.organization.findUnique({
      where: { id: deps.organizationId },
      select: { id: true, subscription_tier: true },
    })
    : deps.organizationId
      ? { id: deps.organizationId, subscription_tier: deps.subscriptionTier || 'GROWTH' }
      : null);

  if (!organization) {
    const error = new Error('Organization not found');
    error.statusCode = 404;
    throw error;
  }

  if (organization.subscription_tier && !['GROWTH', 'ENTERPRISE'].includes(organization.subscription_tier)) {
    const error = new Error('API keys are only available on Growth and Enterprise plans');
    error.statusCode = 403;
    throw error;
  }

  const record = await prisma.apiKey.create({
    data: {
      organization_id: organization.id,
      name: deps.name,
      key_hash: hash,
      key_prefix: prefix,
      created_by: deps.createdBy,
      expires_at: deps.expiresAt || null,
      is_active: true,
    },
  });

  await prisma.auditLog?.create?.({
    data: {
      organization_id: organization.id,
      user_id: deps.createdBy,
      action: 'api_key_created',
      resource_type: 'api_key',
      resource_id: record.id,
      metadata: { name: deps.name, key_prefix: prefix },
    },
  });

  return { key: rawKey, record };
}

async function revokeApiKey(deps = {}) {
  const prisma = deps.prisma || getPrisma();
  const result = await prisma.apiKey.updateMany({
    where: {
      id: deps.apiKeyId,
      organization_id: deps.organizationId,
    },
    data: {
      is_active: false,
    },
  });

  await prisma.auditLog?.create?.({
    data: {
      organization_id: deps.organizationId,
      user_id: deps.revokedBy || null,
      action: 'api_key_revoked',
      resource_type: 'api_key',
      resource_id: deps.apiKeyId,
      metadata: { name: deps.name || null },
    },
  });

  return { revoked: result.count > 0 };
}

async function listApiKeysForOrganization(deps = {}) {
  const prisma = deps.prisma || getPrisma();
  return prisma.apiKey.findMany({
    where: { organization_id: deps.organizationId },
    orderBy: { created_at: 'desc' },
  });
}

async function authenticateApiKey(deps = {}) {
  const prisma = deps.prisma || getPrisma();
  const rawKey = deps.rawKey || '';
  if (!rawKey.startsWith('va_live_')) {
    return null;
  }

  const prefix = getApiKeyPrefix(rawKey);
  const candidate = await prisma.apiKey.findFirst({
    where: {
      key_prefix: prefix,
      is_active: true,
    },
  });

  if (!candidate) {
    return null;
  }

  const matches = deps.bcryptCompare
    ? await deps.bcryptCompare(rawKey, candidate.key_hash)
    : await bcrypt.compare(rawKey, candidate.key_hash);

  if (!matches) {
    return null;
  }

  await prisma.apiKey.update({
    where: { id: candidate.id },
    data: { last_used_at: new Date() },
  });

  if (deps.skipRateLimit !== true && !(process.env.NODE_ENV === 'test' && !deps.redis)) {
    await enforceApiKeyRateLimit(candidate.id, deps.rateLimit || 100, deps);
  }

  const organization = await prisma.organization.findUnique({
    where: { id: candidate.organization_id },
  });

  return { apiKey: candidate, organization };
}

module.exports = {
  generateRawApiKey,
  getApiKeyPrefix,
  createApiKey,
  revokeApiKey,
  listApiKeysForOrganization,
  authenticateApiKey,
};
