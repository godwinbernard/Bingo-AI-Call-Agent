const { getPrisma } = require('../../data/prisma');

async function createSession(agentId, orgId, campaignId = null, twilioDevice = null) {
  return getPrisma().dialerSession.create({
    data: {
      agent_id: agentId,
      org_id: orgId,
      campaign_id: campaignId,
      twilio_device: twilioDevice,
      status: 'ACTIVE',
      calls_made: 0,
      started_at: new Date(),
    },
  });
}

async function updateSession(sessionId, updates) {
  return getPrisma().dialerSession.update({
    where: { id: sessionId },
    data: {
      ...updates,
    },
  });
}

async function endSession(sessionId) {
  const existing = await getPrisma().dialerSession.findUnique({ where: { id: sessionId } });
  if (!existing) {
    throw new Error(`Dialer session ${sessionId} not found`);
  }

  const endedAt = new Date();
  const updated = await getPrisma().dialerSession.update({
    where: { id: sessionId },
    data: {
      status: 'ENDED',
      ended_at: endedAt,
    },
  });

  const startedAt = existing.started_at ? new Date(existing.started_at).getTime() : endedAt.getTime();
  const durationSeconds = Math.max(0, Math.round((endedAt.getTime() - startedAt) / 1000));

  return {
    ...updated,
    duration_seconds: durationSeconds,
    calls_made: updated.calls_made || existing.calls_made || 0,
  };
}

async function getActiveSession(agentId) {
  return getPrisma().dialerSession.findFirst({
    where: {
      agent_id: agentId,
      status: 'ACTIVE',
    },
    orderBy: { started_at: 'desc' },
  });
}

module.exports = {
  createSession,
  updateSession,
  endSession,
  getActiveSession,
};
