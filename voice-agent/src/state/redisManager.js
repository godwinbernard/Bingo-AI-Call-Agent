const Redis = require('ioredis');

let client = null;

function getClient() {
  if (!client) {
    client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
    client.on('error', (err) => console.error('[Redis] Connection error:', err.message));
  }
  return client;
}

const SESSION_TTL = 3600; // 1 hour

async function setCallSession(callSid, data) {
  const redis = getClient();
  await redis.set(`call:${callSid}`, JSON.stringify(data), 'EX', SESSION_TTL);
}

async function getCallSession(callSid) {
  const redis = getClient();
  const data = await redis.get(`call:${callSid}`);
  return data ? JSON.parse(data) : null;
}

async function updateCallSession(callSid, updates) {
  const session = await getCallSession(callSid);
  if (!session) return null;
  const updated = { ...session, ...updates, updatedAt: new Date().toISOString() };
  await setCallSession(callSid, updated);
  return updated;
}

async function deleteCallSession(callSid) {
  const redis = getClient();
  await redis.del(`call:${callSid}`);
}

async function appendConversationTurn(callSid, role, content) {
  const session = await getCallSession(callSid);
  if (!session) return null;
  const messages = session.messages || [];
  messages.push({ role, content });
  return updateCallSession(callSid, { messages });
}

async function incrementActiveCalls() {
  const redis = getClient();
  return redis.incr('active_calls');
}

async function decrementActiveCalls() {
  const redis = getClient();
  const val = await redis.decr('active_calls');
  return Math.max(0, val);
}

async function getActiveCalls() {
  const redis = getClient();
  const val = await redis.get('active_calls');
  return parseInt(val || '0', 10);
}

async function ping() {
  try {
    const redis = getClient();
    await redis.ping();
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  getClient,
  setCallSession,
  getCallSession,
  updateCallSession,
  deleteCallSession,
  appendConversationTurn,
  incrementActiveCalls,
  decrementActiveCalls,
  getActiveCalls,
  ping,
};
