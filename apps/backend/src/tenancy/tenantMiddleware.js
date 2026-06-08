const { authenticateRequest } = require('../auth/clerkClient');
const { loadTenantContext } = require('./tenantContext');
const { getPrisma } = require('../data/prisma');
const { verifyImpersonationToken } = require('../admin/adminService');

function isActiveSubscription(organization) {
  return organization?.subscription_status === 'active' || organization?.subscription_status === 'trialing' || organization?.subscription_status === 'past_due';
}

function isPaidMutationAllowed(organization) {
  return organization?.subscription_status === 'active' || organization?.subscription_status === 'trialing';
}

async function requireTenant(req, res, next) {
  try {
    const impersonationToken = req.headers['x-impersonation-token'];
    let auth = req.auth || null;
    let context = null;

    if (impersonationToken) {
      const payload = verifyImpersonationToken(impersonationToken);
      if (!payload) {
        return res.status(401).json({ error: 'Invalid impersonation token' });
      }

      const prisma = getPrisma();
      const organization = await prisma.organization.findUnique({
        where: { id: payload.organizationId },
      });

      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      auth = {
        userId: payload.supportUserId || 'support',
        isImpersonating: true,
      };
      context = {
        organization,
        member: {
          id: `impersonation_${organization.id}`,
          organization_id: organization.id,
          user_id: auth.userId,
          email: organization.billing_email,
          name: organization.name,
          role: 'OWNER',
          status: 'active',
        },
      };
    } else {
      auth = auth || (await authenticateRequest(req));
      context = await loadTenantContext(auth.userId);
    }

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

function requireBillingMutationAccess(req, res, next) {
  if (!req.organization) {
    return res.status(500).json({ error: 'Organization context missing' });
  }

  if (!isPaidMutationAllowed(req.organization)) {
    return res.status(402).json({
      error: `Paid actions are unavailable while subscription is ${req.organization.subscription_status}`,
    });
  }

  return next();
}

module.exports = {
  requireTenant,
  requireBillingAccess,
  requireBillingMutationAccess,
  isActiveSubscription,
  isPaidMutationAllowed,
};
