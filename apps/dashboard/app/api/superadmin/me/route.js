import superadminAuth from '@/lib/superadminAuth';
import adminAuth from '@/lib/adminAuth';

const { assertSuperadminRequest } = superadminAuth;
const { getEffectiveAdminSecret, createAdminCookie } = adminAuth;

export async function GET(request) {
  const unauthorized = assertSuperadminRequest(request);
  if (unauthorized) return unauthorized;

  // Superadmins also get admin access automatically
  const adminSecret = getEffectiveAdminSecret();
  let overview = null;
  if (adminSecret) {
    // Try to fetch overview data if admin API is wired up
    try {
      const adminRes = await fetch(new URL('/api/admin/overview', request.url).toString(), {
        headers: { cookie: `voiceagent_admin_secret=${encodeURIComponent(adminSecret)}` },
      });
      if (adminRes.ok) {
        overview = await adminRes.json();
      }
    } catch {
      // non-fatal — dashboard shows placeholders
    }
  }

  const response = Response.json({ ok: true, role: 'superadmin', overview });
  // Auto-grant admin cookie so superadmins can use admin routes without re-authenticating
  if (adminSecret) {
    response.headers.set('Set-Cookie', createAdminCookie(adminSecret));
  }
  return response;
}
