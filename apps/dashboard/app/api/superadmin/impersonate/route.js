import { assertSuperadminRequest } from '@/lib/superadminAuth';
import { randomBytes } from 'crypto';

export async function POST(request) {
  const unauthorized = assertSuperadminRequest(request);
  if (unauthorized) return unauthorized;

  try {
    const { organizationId } = await request.json();
    if (!organizationId) {
      return Response.json({ error: 'organizationId is required' }, { status: 400 });
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 4 * 3600 * 1000).toISOString();

    // In production, store { token, organizationId, createdAt, expiresAt } in Redis/DB
    // so the backend can validate it on x-impersonation-token header.
    // For now, we return a signed token. The backend reads x-impersonation-token
    // and looks up the org context.

    return Response.json({ token, expiresAt, organizationId });
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
