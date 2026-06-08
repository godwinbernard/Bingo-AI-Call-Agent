import superadminAuth from '@/lib/superadminAuth';

const { clearSuperadminCookie } = superadminAuth;

export async function POST() {
  const response = Response.json({ ok: true });
  response.headers.set('Set-Cookie', clearSuperadminCookie());
  return response;
}
