import { assertSuperadminRequest } from '@/lib/superadminAuth';

const VALID_ACTIONS = ['comp', 'trial', 'tier', 'mrr'];

export async function POST(request) {
  const unauthorized = assertSuperadminRequest(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { organizationId, action, ...params } = body;

    if (!organizationId) {
      return Response.json({ error: 'organizationId is required' }, { status: 400 });
    }
    if (!VALID_ACTIONS.includes(action)) {
      return Response.json({ error: `action must be one of: ${VALID_ACTIONS.join(', ')}` }, { status: 400 });
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL;

    if (backendUrl) {
      const res = await fetch(`${backendUrl}/api/admin/billing-override`, {
        method: 'POST',
        headers: {
          'x-admin-secret': process.env.ADMIN_SECRET || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ organizationId, action, ...params }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return Response.json({ error: err.error || 'Backend override failed' }, { status: res.status });
      }

      return Response.json({ ok: true });
    }

    // No backend — log the action and return success (dev mode)
    console.log('[superadmin] billing-override (dev mode):', { organizationId, action, ...params });
    return Response.json({ ok: true, devMode: true });
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
