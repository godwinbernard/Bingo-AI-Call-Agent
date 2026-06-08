import adminAuth from '@/lib/adminAuth';

const { createAdminCookie, getEffectiveAdminSecret } = adminAuth;

export async function POST(request) {
  const { secret } = await request.json().catch(() => ({}));

  const effectiveSecret = getEffectiveAdminSecret();
  if (!effectiveSecret || secret !== effectiveSecret) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const response = Response.json({ ok: true });
  response.headers.set('Set-Cookie', createAdminCookie(secret));
  return response;
}
