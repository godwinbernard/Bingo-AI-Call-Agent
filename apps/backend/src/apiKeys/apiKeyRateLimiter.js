const Redis = require('ioredis');

let client = null;

function getRedisClient() {
  if (!client) {
    client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });
  }

  return client;
}

function rateLimitKey(apiKeyId, bucket = Math.floor(Date.now() / 60000)) {
  return `api-key:${apiKeyId}:${bucket}`;
}

async function enforceApiKeyRateLimit(apiKeyId, limit = 100, deps = {}) {
  const redis = deps.redis || getRedisClient();
  const bucket = deps.bucket || Math.floor(Date.now() / 60000);
  const key = rateLimitKey(apiKeyId, bucket);

  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, 70);
  }

  if (current > limit) {
    const error = new Error('API key rate limit exceeded');
    error.statusCode = 429;
    throw error;
  }

  return { remaining: Math.max(limit - current, 0), limit, current };
}

module.exports = { getRedisClient, rateLimitKey, enforceApiKeyRateLimit };
