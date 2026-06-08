const {
  createApiKey,
  revokeApiKey,
  authenticateApiKey,
  listApiKeysForOrganization,
} = require('../../src/apiKeys/apiKeyService');

describe('api key service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a hashed api key and stores the prefix', async () => {
    const prisma = {
      apiKey: {
        create: jest.fn().mockResolvedValue({
          id: 'key_1',
          key_prefix: 'va_live_abcd',
        }),
      },
    };

    const result = await createApiKey({
      prisma,
      organizationId: 'org_1',
      name: 'Primary',
      createdBy: 'user_1',
    });

    expect(result.key).toMatch(/^va_live_/);
    expect(result.record.key_prefix).toBeTruthy();
    expect(prisma.apiKey.create).toHaveBeenCalled();
  });

  it('revokes an api key for the current organization', async () => {
    const prisma = {
      apiKey: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };

    const result = await revokeApiKey({
      prisma,
      apiKeyId: 'key_1',
      organizationId: 'org_1',
    });

    expect(result.revoked).toBe(true);
    expect(prisma.apiKey.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: 'key_1', organization_id: 'org_1' }),
    }));
  });

  it('authenticates a live api key by prefix and hash', async () => {
    const compare = jest.fn().mockResolvedValue(true);
    const prisma = {
      apiKey: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'key_1',
          organization_id: 'org_1',
          key_hash: 'hash_1',
          key_prefix: 'va_live_abcd',
          is_active: true,
        }),
        update: jest.fn().mockResolvedValue({ id: 'key_1' }),
      },
      organization: {
        findUnique: jest.fn().mockResolvedValue({ id: 'org_1', name: 'Acme' }),
      },
    };

    const result = await authenticateApiKey({
      prisma,
      rawKey: 'va_live_abcd1234567890',
      bcryptCompare: compare,
    });

    expect(result.organization.id).toBe('org_1');
    expect(compare).toHaveBeenCalled();
    expect(prisma.apiKey.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ last_used_at: expect.any(Date) }),
    }));
  });

  it('lists api keys for an organization', async () => {
    const prisma = {
      apiKey: {
        findMany: jest.fn().mockResolvedValue([{ id: 'key_1' }]),
      },
    };

    const keys = await listApiKeysForOrganization({ prisma, organizationId: 'org_1' });

    expect(keys).toHaveLength(1);
    expect(prisma.apiKey.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { organization_id: 'org_1' },
    }));
  });
});
