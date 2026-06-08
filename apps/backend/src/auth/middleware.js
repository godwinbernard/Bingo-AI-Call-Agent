const { authenticateRequest } = require('./clerkClient');

function sendAuthError(res, error) {
  const status = error.statusCode || 401;
  return res.status(status).json({ error: error.message || 'Unauthorized' });
}

function readCookieValue(headers, cookieName) {
  const cookieHeader = headers?.cookie || '';
  const cookies = cookieHeader.split(';').map((part) => part.trim()).filter(Boolean);
  const match = cookies.find((cookie) => cookie.startsWith(`${cookieName}=`));
  return match ? decodeURIComponent(match.slice(cookieName.length + 1)) : '';
}

async function requireAuth(req, res, next) {
  try {
    req.auth = await authenticateRequest(req);
    return next();
  } catch (error) {
    return sendAuthError(res, error);
  }
}

function requireAdminSecret(req, res, next) {
  const cookieSecret = readCookieValue(req.headers, 'voiceagent_admin_secret');
  const secret = req.headers['x-admin-secret'] || cookieSecret;
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return next();
}

module.exports = { requireAuth, requireAdminSecret };
