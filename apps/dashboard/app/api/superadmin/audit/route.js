import { assertSuperadminRequest } from '@/lib/superadminAuth';

const MOCK_ENTRIES = [
  { id: '1', actor: 'superadmin', action: 'impersonate', target_org: 'Acme Corp', target_org_id: 'org_1', ip: '192.168.1.1', created_at: new Date(Date.now() - 120000).toISOString(), meta: { duration: '12 minutes' } },
  { id: '2', actor: 'superadmin', action: 'tier_change', target_org: 'Beta Industries', target_org_id: 'org_2', ip: '192.168.1.1', created_at: new Date(Date.now() - 3600000).toISOString(), meta: { from: 'STARTER', to: 'GROWTH' } },
  { id: '3', actor: 'superadmin', action: 'comp_account', target_org: 'Startup XYZ', target_org_id: 'org_3', ip: '192.168.1.1', created_at: new Date(Date.now() - 7200000).toISOString(), meta: {} },
  { id: '4', actor: 'superadmin', action: 'feature_flag', target_org: 'Acme Corp', target_org_id: 'org_1', ip: '192.168.1.1', created_at: new Date(Date.now() - 86400000).toISOString(), meta: { flag: 'beta_features', value: true } },
  { id: '5', actor: 'superadmin', action: 'login', target_org: null, target_org_id: null, ip: '192.168.1.1', created_at: new Date(Date.now() - 90000000).toISOString(), meta: {} },
  { id: '6', actor: 'superadmin', action: 'trial_extend', target_org: 'Early Bird Co', target_org_id: 'org_4', ip: '192.168.1.1', created_at: new Date(Date.now() - 172800000).toISOString(), meta: { days: 30 } },
  { id: '7', actor: 'superadmin', action: 'billing_override', target_org: 'Enterprise Inc', target_org_id: 'org_5', ip: '192.168.1.1', created_at: new Date(Date.now() - 259200000).toISOString(), meta: { mrr: 4999 } },
];

export async function GET(request) {
  const unauthorized = assertSuperadminRequest(request);
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '25', 10);
  const q = searchParams.get('q') || '';
  const actionFilter = searchParams.get('action') || '';

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL;

  if (backendUrl) {
    try {
      const params = new URLSearchParams({ page, limit });
      if (q) params.set('q', q);
      if (actionFilter) params.set('action', actionFilter);

      const res = await fetch(`${backendUrl}/api/admin/audit-log?${params}`, {
        headers: { 'x-admin-secret': process.env.ADMIN_SECRET || '' },
      });

      if (res.ok) {
        const data = await res.json();
        return Response.json(data);
      }
    } catch { /* fall through to mock */ }
  }

  // Filter mock data
  let entries = MOCK_ENTRIES.filter((e) => {
    if (q && !e.target_org?.toLowerCase().includes(q.toLowerCase()) && !e.action.includes(q.toLowerCase()) && !e.ip.includes(q)) return false;
    if (actionFilter && e.action !== actionFilter) return false;
    return true;
  });

  const total = entries.length;
  const start = (page - 1) * limit;
  entries = entries.slice(start, start + limit);

  return Response.json({ entries, total, page, limit });
}
