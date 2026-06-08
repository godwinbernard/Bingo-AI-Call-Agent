const { getPrisma } = require('../data/prisma');

function mergeWhere(where, organizationId) {
  return {
    ...(where || {}),
    organization_id: organizationId,
  };
}

function scopedDelegate(delegate, organizationId) {
  return new Proxy(delegate, {
    get(target, prop) {
      const value = target[prop];
      if (typeof value !== 'function') {
        return value;
      }

      return async function scopedOperation(args = {}) {
        const nextArgs = { ...args };

        if (prop === 'create') {
          nextArgs.data = { ...(args.data || {}), organization_id: organizationId };
        } else if (prop === 'createMany') {
          nextArgs.data = (args.data || []).map((row) => ({ ...row, organization_id: organizationId }));
        } else if (prop === 'update' || prop === 'delete' || prop === 'findUnique' || prop === 'findFirst' || prop === 'count' || prop === 'aggregate' || prop === 'deleteMany' || prop === 'updateMany' || prop === 'findMany' || prop === 'upsert') {
          nextArgs.where = mergeWhere(args.where, organizationId);
          if (prop === 'upsert') {
            nextArgs.create = { ...(args.create || {}), organization_id: organizationId };
            nextArgs.update = { ...(args.update || {}), organization_id: organizationId };
          }
        }

        return value.call(target, nextArgs);
      };
    },
  });
}

function createTenantPrisma(organizationId, prisma = getPrisma()) {
  if (!organizationId) {
    throw new Error('organization_id is required');
  }

  return new Proxy({}, {
    get(_target, modelName) {
      if (typeof prisma[modelName] === 'undefined') {
        return prisma[modelName];
      }
      return scopedDelegate(prisma[modelName], organizationId);
    },
  });
}

function tenant(req, prisma = getPrisma()) {
  const organizationId = req?.organization?.id || req?.org?.id || req?.organization_id;
  return createTenantPrisma(organizationId, prisma);
}

module.exports = { createTenantPrisma, tenant };
