const SUPERADMIN_COOKIE_NAME = 'voiceagent_superadmin_secret';

function readCookieValue(request, cookieName) {
  if (request.cookies?.get) {
    const cookie = request.cookies.get(cookieName);
    if (cookie?.value) return cookie.value;
  }
  const cookieHeader = request.headers?.get?.('cookie') || '';
  const cookies = cookieHeader.split(';').map((p) => p.trim()).filter(Boolean);
  const match = cookies.find((c) => c.startsWith(`${cookieName}=`));
  return match ? decodeURIComponent(match.slice(cookieName.length + 1)) : '';
}

function getEffectiveSuperadminSecret(secret = process.env.SUPERADMIN_SECRET) {
  if (secret) return secret;
  return process.env.NODE_ENV === 'production' ? '' : 'dev-superadmin-secret';
}

function getSuperadminSecretFromRequest(request) {
  return readCookieValue(request, SUPERADMIN_COOKIE_NAME);
}

function isSuperadminRequestAuthorized(request, secret = getEffectiveSuperadminSecret()) {
  if (!secret) return false;
  return getSuperadminSecretFromRequest(request) === secret;
}

function createSuperadminCookie(secret) {
  return `${SUPERADMIN_COOKIE_NAME}=${encodeURIComponent(secret)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800`;
}

function clearSuperadminCookie() {
  return `${SUPERADMIN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}

function assertSuperadminRequest(request, secret = getEffectiveSuperadminSecret()) {
  if (!isSuperadminRequestAuthorized(request, secret)) {
    return new Response('Unauthorized', { status: 401 });
  }
  return null;
}

module.exports = {
  getEffectiveSuperadminSecret,
  isSuperadminRequestAuthorized,
  createSuperadminCookie,
  clearSuperadminCookie,
  assertSuperadminRequest,
};
