import superadminAuth from '@/lib/superadminAuth';

const { createSuperadminCookie, getEffectiveSuperadminSecret } = superadminAuth;

export async function POST(request) {
  const { secret } = await request.json().catch(() => ({}));

  const effectiveSecret = getEffectiveSuperadminSecret();
  if (!effectiveSecret || secret !== effectiveSecret) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const response = Response.json({ ok: true });
  response.headers.set('Set-Cookie', createSuperadminCookie(secret));
  return response;
}
