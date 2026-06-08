const ADMIN_COOKIE_NAME = 'voiceagent_admin_secret';

function readCookieValue(request, cookieName) {
  if (request.cookies?.get) {
    const cookie = request.cookies.get(cookieName);
    if (cookie?.value) {
      return cookie.value;
    }
  }

  const cookieHeader = request.headers?.get?.('cookie') || '';
  const cookies = cookieHeader.split(';').map((part) => part.trim()).filter(Boolean);
  const match = cookies.find((cookie) => cookie.startsWith(`${cookieName}=`));
  return match ? decodeURIComponent(match.slice(cookieName.length + 1)) : '';
}

function getAdminCookieName() {
  return ADMIN_COOKIE_NAME;
}

function getEffectiveAdminSecret(adminSecret = process.env.ADMIN_SECRET) {
  if (adminSecret) {
    return adminSecret;
  }

  return process.env.NODE_ENV === 'production' ? '' : 'dev-admin-secret';
}

function getAdminSecretFromRequest(request) {
  return readCookieValue(request, ADMIN_COOKIE_NAME);
}

function isAdminRequestAuthorized(request, adminSecret = getEffectiveAdminSecret()) {
  if (!adminSecret) {
    return false;
  }

  return getAdminSecretFromRequest(request) === adminSecret;
}

function createAdminCookie(secret) {
  return `${ADMIN_COOKIE_NAME}=${encodeURIComponent(secret)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`;
}

function clearAdminCookie() {
  return `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

function assertAdminRequest(request, adminSecret = getEffectiveAdminSecret()) {
  if (!isAdminRequestAuthorized(request, adminSecret)) {
    return new Response('Unauthorized', { status: 401 });
  }

  return null;
}

module.exports = {
  getAdminCookieName,
  getEffectiveAdminSecret,
  getAdminSecretFromRequest,
  isAdminRequestAuthorized,
  createAdminCookie,
  clearAdminCookie,
  assertAdminRequest,
};
