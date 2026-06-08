const { authenticateRequest } = require('./clerkClient');

function sendAuthError(res, error) {
  const status = error.statusCode || 401;
  return res.status(status).json({ error: error.message || 'Unauthorized' });
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
  const secret = req.headers['x-admin-secret'];
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return next();
}

module.exports = { requireAuth, requireAdminSecret };
