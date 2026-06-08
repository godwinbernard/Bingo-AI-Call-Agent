const PERMISSIONS = {
  OWNER: new Set([
    'billing.manage',
    'member.manage',
    'campaign.create',
    'campaign.edit',
    'campaign.start',
    'campaign.stop',
    'script.create',
    'script.edit',
    'organization.delete',
    'calls.view',
    'reports.view',
    'dashboard.view',
  ]),
  ADMIN: new Set([
    'member.manage',
    'campaign.create',
    'campaign.edit',
    'campaign.start',
    'campaign.stop',
    'script.create',
    'script.edit',
    'calls.view',
    'reports.view',
    'dashboard.view',
  ]),
  MANAGER: new Set([
    'campaign.create',
    'campaign.edit',
    'campaign.start',
    'campaign.stop',
    'script.create',
    'script.edit',
    'calls.view',
    'reports.view',
    'dashboard.view',
  ]),
  VIEWER: new Set(['calls.view', 'reports.view', 'dashboard.view']),
};

function matchesWildcard(actionSet, action) {
  const prefix = action.split('.')[0];
  return actionSet.has(`${prefix}.*`);
}

function checkPermission(member, action) {
  const role = member?.role || 'VIEWER';
  const actionSet = PERMISSIONS[role] || PERMISSIONS.VIEWER;
  if (actionSet.has(action) || matchesWildcard(actionSet, action)) {
    return true;
  }
  const error = new Error('Forbidden');
  error.statusCode = 403;
  throw error;
}

function permissionMiddleware(action) {
  return (req, res, next) => {
    try {
      checkPermission(req.member || req.organizationMember, action);
      return next();
    } catch (error) {
      return res.status(error.statusCode || 403).json({ error: error.message });
    }
  };
}

module.exports = { PERMISSIONS, checkPermission, permissionMiddleware };
