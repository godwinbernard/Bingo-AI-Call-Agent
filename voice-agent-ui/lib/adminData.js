const ORGANIZATIONS = [
  {
    id: 'org_001',
    name: 'Acme Inc',
    plan: 'GROWTH',
    mrr: 29900,
    calls_used_this_month: 847,
    calls_limit: 2000,
    status: 'active',
    joined_at: '2026-01-03T10:00:00Z',
    trial_ends_at: null,
  },
  {
    id: 'org_002',
    name: 'Northwind',
    plan: 'ENTERPRISE',
    mrr: 99900,
    calls_used_this_month: 12400,
    calls_limit: null,
    status: 'active',
    joined_at: '2026-01-14T10:00:00Z',
    trial_ends_at: null,
  },
  {
    id: 'org_003',
    name: 'Vertex Labs',
    plan: 'STARTER',
    mrr: 9900,
    calls_used_this_month: 482,
    calls_limit: 500,
    status: 'trialing',
    joined_at: '2026-05-20T10:00:00Z',
    trial_ends_at: '2026-06-21T10:00:00Z',
  },
  {
    id: 'org_004',
    name: 'Summit Health',
    plan: 'PAY_AS_YOU_GO',
    mrr: 0,
    calls_used_this_month: 219,
    calls_limit: 0,
    status: 'past_due',
    joined_at: '2026-03-04T10:00:00Z',
    trial_ends_at: null,
  },
];

const PLAN_MRR = {
  STARTER: 9900,
  GROWTH: 29900,
  ENTERPRISE: 99900,
  PAY_AS_YOU_GO: 0,
};

function formatCurrency(amountInCents) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amountInCents / 100);
}

function formatShortDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getAdminOrganizations() {
  return ORGANIZATIONS.map((organization) => ({
    ...organization,
    joined_label: formatShortDate(organization.joined_at),
    mrr_label: formatCurrency(organization.mrr),
    calls_label: organization.calls_limit === null ? 'Unlimited' : `${organization.calls_used_this_month.toLocaleString()} / ${organization.calls_limit.toLocaleString()}`,
  }));
}

function buildAdminOverview(organizations = getAdminOrganizations()) {
  const totalOrganizations = organizations.length;
  const activeTrials = organizations.filter((organization) => organization.status === 'trialing').length;
  const churnedThisMonth = organizations.filter((organization) => organization.status === 'canceled').length;
  const totalCallsToday = organizations.reduce((sum, organization) => sum + Math.floor(organization.calls_used_this_month / 30), 0);
  const mrr = organizations.reduce((sum, organization) => sum + (PLAN_MRR[organization.plan] || 0), 0);

  return {
    totalOrganizations,
    mrr,
    activeTrials,
    churnedThisMonth,
    totalCallsToday,
  };
}

function buildAdminCustomers(organizations = getAdminOrganizations()) {
  return organizations.map((organization) => ({
    name: organization.name,
    plan: organization.plan,
    mrr: organization.mrr_label,
    calls: organization.calls_label,
    status: organization.status,
    joined: organization.joined_label,
  }));
}

function buildAdminRevenueSummary(organizations = getAdminOrganizations()) {
  const mrr = organizations.reduce((sum, organization) => sum + (PLAN_MRR[organization.plan] || 0), 0);
  const active = organizations.filter((organization) => organization.status === 'active').length;
  const trials = organizations.filter((organization) => organization.status === 'trialing').length;
  const churned = organizations.filter((organization) => organization.status === 'canceled').length;

  return {
    mrr: formatCurrency(mrr),
    activeOrganizations: active,
    trialOrganizations: trials,
    churnedOrganizations: churned,
    ltvEstimate: formatCurrency(mrr * 12),
  };
}

module.exports = {
  getAdminOrganizations,
  buildAdminOverview,
  buildAdminCustomers,
  buildAdminRevenueSummary,
};
