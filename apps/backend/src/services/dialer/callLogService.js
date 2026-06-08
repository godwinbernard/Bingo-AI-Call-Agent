const { getPrisma } = require('../../data/prisma');
const { generateScorecard } = require('../ai/scorecardGenerator');
const { updatePerformance } = require('../performance/agentPerformanceService');

async function createCallLog(params) {
  return getPrisma().humanCall.create({
    data: {
      org_id: params.orgId,
      agent_id: params.agentId,
      contact_id: params.contactId,
      campaign_id: params.campaignId || null,
      twilio_call_sid: params.twilioCallSid,
      twilio_parent_sid: params.twilioParentSid || null,
      direction: params.direction || 'OUTBOUND',
      status: 'INITIATED',
      started_at: params.startedAt || null,
    },
  });
}

function buildStatusUpdate(status, data = {}) {
  const update = { status };

  if (status === 'IN_PROGRESS') {
    update.answered_at = data.answeredAt || new Date();
  }

  if (status === 'COMPLETED') {
    update.ended_at = data.endedAt || new Date();
    if (typeof data.durationSeconds === 'number') {
      update.duration_seconds = data.durationSeconds;
    }
  }

  if (typeof data.durationSeconds === 'number' && status !== 'COMPLETED') {
    update.duration_seconds = data.durationSeconds;
  }

  if (data.recordingUrl) update.recording_url = data.recordingUrl;
  if (data.recordingSid) update.recording_sid = data.recordingSid;
  if (typeof data.recordingDuration === 'number') update.recording_duration = data.recordingDuration;
  if (typeof data.talkTimeAgent === 'number') update.talk_time_agent = data.talkTimeAgent;
  if (typeof data.talkTimeContact === 'number') update.talk_time_contact = data.talkTimeContact;
  if (typeof data.holdTime === 'number') update.hold_time = data.holdTime;

  return update;
}

async function updateCallStatus(callSid, status, data = {}) {
  const update = buildStatusUpdate(status, data);
  return getPrisma().humanCall.update({
    where: { twilio_call_sid: callSid },
    data: update,
  });
}

async function logOutcome(callId, outcome, notes) {
  const updated = await getPrisma().humanCall.update({
    where: { id: callId },
    data: {
      outcome,
      outcome_notes: notes || null,
      status: 'COMPLETED',
      ended_at: new Date(),
    },
  });

  const scorecard = await generateScorecard(callId);
  await updatePerformance(updated.agent_id, updated.org_id, scorecard);

  return {
    ...updated,
    scorecard,
  };
}

async function getCallHistory(agentId, filters = {}) {
  const where = { agent_id: agentId };

  if (filters.outcome) where.outcome = filters.outcome;
  if (filters.startDate || filters.endDate) {
    where.created_at = {};
    if (filters.startDate) where.created_at.gte = new Date(filters.startDate);
    if (filters.endDate) where.created_at.lte = new Date(filters.endDate);
  }
  if (typeof filters.minScore === 'number') {
    where.scorecard = { is: { overall_score: { gte: filters.minScore } } };
  }

  const take = Math.min(Math.max(Number(filters.limit || 25), 1), 100);
  const skip = Number(filters.offset || 0);

  return getPrisma().humanCall.findMany({
    where,
    orderBy: { created_at: 'desc' },
    take,
    skip,
    include: {
      transcript: true,
      scorecard: true,
    },
  });
}

module.exports = {
  createCallLog,
  updateCallStatus,
  logOutcome,
  getCallHistory,
};
