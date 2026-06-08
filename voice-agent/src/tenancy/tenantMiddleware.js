const { authenticateRequest } = require('../auth/clerkClient');
const { loadTenantContext } = require('./tenantContext');

function isActiveSubscription(organization) {
  return organization?.subscription_status === 'active' || organization?.subscription_status === 'trialing' || organization?.subscription_status === 'past_due';
}

async function requireTenant(req, res, next) {
  try {
    const auth = req.auth || (await authenticateRequest(req));
    const context = await loadTenantContext(auth.userId);

    if (!context) {
      return res.status(404).json({ error: 'Organization membership not found' });
    }

    if (context.member.status === 'suspended') {
      return res.status(403).json({ error: 'Member suspended' });
    }

    if (!isActiveSubscription(context.organization)) {
      return res.status(402).json({ error: 'Subscription inactive' });
    }

    req.auth = auth;
    req.organization = context.organization;
    req.org = context.organization;
    req.member = context.member;
    req.organizationMember = context.member;
    return next();
  } catch (error) {
    return res.status(error.statusCode || 401).json({ error: error.message || 'Unauthorized' });
  }
}

function requireBillingAccess(req, res, next) {
  if (!req.member || req.member.role !== 'OWNER') {
    return res.status(403).json({ error: 'Billing access requires OWNER role' });
  }
  return next();
}

module.exports = { requireTenant, requireBillingAccess, isActiveSubscription };
