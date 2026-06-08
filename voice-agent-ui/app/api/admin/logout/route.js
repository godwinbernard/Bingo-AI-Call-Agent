import adminAuth from '@/lib/adminAuth';

const { clearAdminCookie } = adminAuth;

export async function POST() {
  const response = Response.json({ ok: true });
  response.headers.set('Set-Cookie', clearAdminCookie());
  return response;
}
