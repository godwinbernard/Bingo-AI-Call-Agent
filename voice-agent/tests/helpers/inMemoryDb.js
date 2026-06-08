class InMemoryPool {
  constructor() {
    this.callLogs = [];
    this.listeners = new Map();
    this.schemaCreated = false;
  }

  on(event, handler) {
    this.listeners.set(event, handler);
    return this;
  }

  emitError(error) {
    const listener = this.listeners.get('error');
    if (listener) listener(error);
  }

  async query(sql, params = []) {
    const normalized = sql.trim().replace(/\s+/g, ' ');

    if (/^CREATE TABLE IF NOT EXISTS call_logs/i.test(normalized) || /^CREATE INDEX IF NOT EXISTS/i.test(normalized)) {
      this.schemaCreated = true;
      return { rows: [], rowCount: 0 };
    }

    if (/^INSERT INTO call_logs/i.test(normalized)) {
      const hasOrganizationId = /organization_id/i.test(normalized);
      const [organizationId, callSid, campaignId, phoneNumber, contactName] = hasOrganizationId
        ? params
        : [null, ...params];
      const exists = this.callLogs.find((row) => row.call_sid === callSid);
      if (!exists) {
        this.callLogs.push({
          id: this.callLogs.length + 1,
          organization_id: organizationId,
          call_sid: callSid,
          campaign_id: campaignId,
          phone_number: phoneNumber,
          contact_name: contactName,
          status: 'initiated',
          direction: 'outbound',
          duration_seconds: 0,
          outcome: null,
          answering_machine: false,
          transcript: [],
          error_message: null,
          started_at: new Date().toISOString(),
          ended_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
      return { rows: [], rowCount: 1 };
    }

    if (/^UPDATE call_logs SET/i.test(normalized)) {
      const callSid = params[params.length - 1];
      const row = this.callLogs.find((entry) => entry.call_sid === callSid);
      if (!row) {
        return { rows: [], rowCount: 0 };
      }

      const assignments = normalized
        .replace(/^UPDATE call_logs SET /i, '')
        .replace(/ WHERE call_sid = \$\d+$/i, '')
        .split(', ')
        .filter((part) => part.includes('= $'));

      for (const assignment of assignments) {
        const match = assignment.match(/^([a-z_]+) = \$(\d+)$/i);
        if (!match) continue;
        const [, field, index] = match;
        const value = params[Number(index) - 1];
        row[field] = field === 'transcript' && typeof value === 'string' ? JSON.parse(value) : value;
      }

      if (row.status === 'completed' || row.status === 'failed') {
        row.ended_at = new Date().toISOString();
      }
      row.updated_at = new Date().toISOString();
      return { rows: [], rowCount: 1 };
    }

    if (/^SELECT \* FROM call_logs WHERE call_sid = \$1/i.test(normalized)) {
      const [callSid] = params;
      const row = this.callLogs.find((entry) => entry.call_sid === callSid);
      return { rows: row ? [cloneRow(row)] : [], rowCount: row ? 1 : 0 };
    }

    if (/^SELECT/i.test(normalized) && /FROM call_logs WHERE campaign_id = \$1/i.test(normalized)) {
      const [campaignId, organizationId] = params;
      const rows = this.callLogs.filter((entry) => entry.campaign_id === campaignId && (!organizationId || entry.organization_id === organizationId));
      const completed = rows.filter((entry) => entry.status === 'completed').length;
      const avgDuration = completed
        ? rows
            .filter((entry) => entry.status === 'completed')
            .reduce((sum, entry) => sum + Number(entry.duration_seconds || 0), 0) / completed
        : null;

      return {
        rows: [
          {
            total: rows.length,
            completed,
            failed: rows.filter((entry) => entry.status === 'failed').length,
            voicemails: rows.filter((entry) => entry.answering_machine === true).length,
            avg_duration: avgDuration,
          },
        ],
        rowCount: 1,
      };
    }

    throw new Error(`Unsupported query: ${normalized}`);
  }
}

function cloneRow(row) {
  return JSON.parse(JSON.stringify(row));
}

module.exports = { InMemoryPool };
