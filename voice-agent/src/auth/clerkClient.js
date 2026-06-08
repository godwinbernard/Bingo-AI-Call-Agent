const { createClerkClient, verifyToken } = require('@clerk/backend');

let clerkClientInstance = null;

function getClerkClient() {
  if (!clerkClientInstance) {
    clerkClientInstance = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
  }
  return clerkClientInstance;
}

function extractBearerToken(req) {
  const authorization = req.headers.authorization || req.headers.Authorization || '';
  if (authorization.startsWith('Bearer ')) {
    return authorization.slice(7);
  }

  const cookieHeader = req.headers.cookie || '';
  const sessionCookie = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('__session='));

  return sessionCookie ? decodeURIComponent(sessionCookie.split('=').slice(1).join('=')) : null;
}

async function authenticateRequest(req) {
  const token = extractBearerToken(req);
  if (!token) {
    const error = new Error('Unauthorized');
    error.statusCode = 401;
    throw error;
  }

  const verifiedToken = await verifyToken(token, {
    secretKey: process.env.CLERK_SECRET_KEY,
    jwtKey: process.env.CLERK_JWT_KEY,
    authorizedParties: process.env.CLERK_ORIGIN ? [process.env.CLERK_ORIGIN] : undefined,
  });

  if (!verifiedToken?.sub) {
    const error = new Error('Unauthorized');
    error.statusCode = 401;
    throw error;
  }

  return {
    userId: verifiedToken.sub,
    sessionId: verifiedToken.sid,
    token: verifiedToken,
  };
}

async function getClerkUser(userId) {
  return getClerkClient().users.getUser(userId);
}

module.exports = {
  getClerkClient,
  authenticateRequest,
  extractBearerToken,
  getClerkUser,
};
