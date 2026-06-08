import { assertSuperadminRequest } from '@/lib/superadminAuth';

export async function GET(request) {
  const unauthorized = assertSuperadminRequest(request);
  if (unauthorized) return unauthorized;

  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL;
    if (!backendUrl) {
      return Response.json({ organizations: getMockOrgs() });
    }

    const res = await fetch(`${backendUrl}/api/admin/organizations`, {
      headers: {
        'x-admin-secret': process.env.ADMIN_SECRET || '',
        'Content-Type': 'application/json',
      },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return Response.json({ organizations: getMockOrgs() });
    }

    const data = await res.json();
    return Response.json({ organizations: data.organizations || data || [] });
  } catch {
    return Response.json({ organizations: getMockOrgs() });
  }
}

function getMockOrgs() {
  return [
    { id: 'org_mock_1', name: 'Acme Corp', slug: 'acme-corp', memberCount: 8, subscription_tier: 'GROWTH', billing_email: 'billing@acme.com', comp: false, trial_end: null, mrr_override: null },
    { id: 'org_mock_2', name: 'Beta Industries', slug: 'beta-industries', memberCount: 3, subscription_tier: 'STARTER', billing_email: 'hello@beta.io', comp: false, trial_end: null, mrr_override: null },
    { id: 'org_mock_3', name: 'Enterprise Inc', slug: 'enterprise-inc', memberCount: 42, subscription_tier: 'ENTERPRISE', billing_email: 'finance@enterprise.com', comp: false, trial_end: null, mrr_override: 4999 },
    { id: 'org_mock_4', name: 'Startup XYZ', slug: 'startup-xyz', memberCount: 2, subscription_tier: 'PAY_AS_YOU_GO', billing_email: 'founder@startup.xyz', comp: true, trial_end: null, mrr_override: null },
    { id: 'org_mock_5', name: 'Early Bird Co', slug: 'early-bird', memberCount: 5, subscription_tier: 'STARTER', billing_email: 'team@earlybird.co', comp: false, trial_end: new Date(Date.now() + 7 * 86400000).toISOString(), mrr_override: null },
  ];
}
