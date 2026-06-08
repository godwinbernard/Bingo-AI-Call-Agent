const { getPrisma } = require('../../data/prisma');

function getPeriodKey(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

async function updatePerformance(agentId, orgId, scorecard) {
  const period = getPeriodKey();
  const prisma = getPrisma();
  const existing = await prisma.agentPerformance.findUnique({
    where: {
      agent_id_period: {
        agent_id: agentId,
        period,
      },
    },
  });

  const nextCallsMade = (existing?.calls_made || 0) + 1;
  const nextCallsConnected = (existing?.calls_connected || 0) + (scorecard?.overall_score ? 1 : 0);
  const nextCallsSuccessful = (existing?.calls_successful || 0) + (scorecard?.overall_score >= 7 ? 1 : 0);
  const nextTotalTalk = (existing?.total_talk_time || 0) + Number(scorecard?.talk_speed_avg || 0);

  const average = (previous, current, count) => ((previous || 0) * (count - 1) + current) / count;

  const record = {
    agent_id: agentId,
    org_id: orgId,
    period,
    calls_made: nextCallsMade,
    calls_connected: nextCallsConnected,
    calls_successful: nextCallsSuccessful,
    total_talk_time: nextTotalTalk,
    avg_overall_score: average(existing?.avg_overall_score, Number(scorecard?.overall_score || 0), nextCallsMade),
    avg_opening: average(existing?.avg_opening, Number(scorecard?.opening_score || 0), nextCallsMade),
    avg_objection: average(existing?.avg_objection, Number(scorecard?.objection_handling_score || 0), nextCallsMade),
    avg_rapport: average(existing?.avg_rapport, Number(scorecard?.rapport_score || 0), nextCallsMade),
    avg_closing: average(existing?.avg_closing, Number(scorecard?.closing_score || 0), nextCallsMade),
    top_issues: Array.from(new Set([...(existing?.top_issues || []), ...((scorecard?.what_to_improve || []).slice(0, 3))])).slice(0, 3),
    improvement_areas: Array.from(new Set([...(existing?.improvement_areas || []), ...((scorecard?.what_to_improve || []).slice(0, 3))])).slice(0, 5),
    score_trend: [...(existing?.score_trend || []), Number(scorecard?.overall_score || 0)].slice(-12),
  };

  return prisma.agentPerformance.upsert({
    where: {
      agent_id_period: {
        agent_id: agentId,
        period,
      },
    },
    update: record,
    create: record,
  });
}

async function getPerformanceSummary(agentId, months = 3) {
  const prisma = getPrisma();
  const now = new Date();
  const periods = Array.from({ length: months }, (_, index) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - index, 1));
    return getPeriodKey(date);
  });

  return prisma.agentPerformance.findMany({
    where: {
      agent_id: agentId,
      period: { in: periods },
    },
    orderBy: { period: 'desc' },
  });
}

async function getTeamLeaderboard(orgId, period = getPeriodKey()) {
  const prisma = getPrisma();
  const rows = await prisma.agentPerformance.findMany({
    where: {
      org_id: orgId,
      period,
    },
    include: {
      agent: true,
    },
    orderBy: [{ avg_overall_score: 'desc' }, { calls_made: 'desc' }],
  });

  return rows.map((row, index) => ({
    ...row,
    rank: index + 1,
  }));
}

module.exports = {
  updatePerformance,
  getPerformanceSummary,
  getTeamLeaderboard,
  getPeriodKey,
};
