const { Pool } = require('pg');

let pool = null;

function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    pool.on('error', (err) => console.error('[DB] Pool error:', err.message));
  }
  return pool;
}

async function runQuery(sql, params = []) {
  try {
    return await getPool().query(sql, params);
  } catch (err) {
    console.error('[DB] Query failed:', err.message);
    return undefined;
  }
}

async function ensureSchema() {
  const result = await runQuery(`
    CREATE TABLE IF NOT EXISTS call_logs (
      id SERIAL PRIMARY KEY,
      organization_id TEXT,
      call_sid TEXT UNIQUE NOT NULL,
      campaign_id TEXT,
      phone_number TEXT NOT NULL,
      contact_name TEXT,
      status TEXT NOT NULL DEFAULT 'initiated',
      direction TEXT DEFAULT 'outbound',
      duration_seconds INTEGER DEFAULT 0,
      outcome TEXT,
      answering_machine BOOLEAN DEFAULT false,
      transcript JSONB DEFAULT '[]',
      error_message TEXT,
      started_at TIMESTAMPTZ DEFAULT NOW(),
      ended_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_call_logs_org ON call_logs(organization_id);
    CREATE INDEX IF NOT EXISTS idx_call_logs_campaign ON call_logs(campaign_id);
    CREATE INDEX IF NOT EXISTS idx_call_logs_phone ON call_logs(phone_number);
    CREATE INDEX IF NOT EXISTS idx_call_logs_status ON call_logs(status);
  `);
  return Boolean(result);
}

async function logCallStart({ callSid, campaignId, phoneNumber, contactName, organizationId = null }) {
  if (!organizationId) {
    return runQuery(
      `INSERT INTO call_logs (call_sid, campaign_id, phone_number, contact_name, status)
       VALUES ($1, $2, $3, $4, 'initiated')
       ON CONFLICT (call_sid) DO NOTHING`,
      [callSid, campaignId, phoneNumber, contactName]
    );
  }

  return runQuery(
    `INSERT INTO call_logs (organization_id, call_sid, campaign_id, phone_number, contact_name, status)
     VALUES ($1, $2, $3, $4, $5, 'initiated')
     ON CONFLICT (call_sid) DO NOTHING`,
    [organizationId, callSid, campaignId, phoneNumber, contactName]
  );
}

async function updateCallStatus(callSid, updates) {
  const fields = [];
  const values = [];
  let idx = 1;

  const allowed = ['status', 'outcome', 'answering_machine', 'error_message', 'duration_seconds', 'transcript'];
  for (const key of allowed) {
    if (updates[key] !== undefined) {
      fields.push(`${key} = $${idx++}`);
      values.push(key === 'transcript' ? JSON.stringify(updates[key]) : updates[key]);
    }
  }

  if (fields.length === 0) return;

  fields.push(`updated_at = NOW()`);
  if (updates.status === 'completed' || updates.status === 'failed') {
    fields.push(`ended_at = NOW()`);
  }

  values.push(callSid);
  return runQuery(
    `UPDATE call_logs SET ${fields.join(', ')} WHERE call_sid = $${idx}`,
    values
  );
}

async function getCallLog(callSid) {
  const result = await runQuery('SELECT * FROM call_logs WHERE call_sid = $1', [callSid]);
  return result?.rows?.[0] || null;
}

async function getCampaignStats(campaignId, organizationId = null) {
  const result = await runQuery(
    organizationId
      ? `SELECT
       COUNT(*) AS total,
       COUNT(*) FILTER (WHERE status = 'completed') AS completed,
       COUNT(*) FILTER (WHERE status = 'failed') AS failed,
       COUNT(*) FILTER (WHERE answering_machine = true) AS voicemails,
       AVG(duration_seconds) FILTER (WHERE status = 'completed') AS avg_duration
     FROM call_logs WHERE campaign_id = $1 AND organization_id = $2`
      : `SELECT
       COUNT(*) AS total,
       COUNT(*) FILTER (WHERE status = 'completed') AS completed,
       COUNT(*) FILTER (WHERE status = 'failed') AS failed,
       COUNT(*) FILTER (WHERE answering_machine = true) AS voicemails,
       AVG(duration_seconds) FILTER (WHERE status = 'completed') AS avg_duration
     FROM call_logs WHERE campaign_id = $1`,
    organizationId ? [campaignId, organizationId] : [campaignId]
  );
  return result?.rows?.[0] || {
    total: 0,
    completed: 0,
    failed: 0,
    voicemails: 0,
    avg_duration: null,
  };
}

module.exports = { getPool, ensureSchema, logCallStart, updateCallStatus, getCallLog, getCampaignStats, runQuery };
