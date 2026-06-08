import { assertSuperadminRequest } from '@/lib/superadminAuth';

// In production, persist flags in a DB or key-value store.
// This in-memory store is fine for the initial implementation.
let flagStore = { global: {}, orgOverrides: {} };

export async function GET(request) {
  const unauthorized = assertSuperadminRequest(request);
  if (unauthorized) return unauthorized;

  return Response.json(flagStore);
}

export async function POST(request) {
  const unauthorized = assertSuperadminRequest(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    if (body.global && typeof body.global === 'object') {
      flagStore.global = body.global;
    }
    if (body.orgOverrides && typeof body.orgOverrides === 'object') {
      flagStore.orgOverrides = body.orgOverrides;
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
