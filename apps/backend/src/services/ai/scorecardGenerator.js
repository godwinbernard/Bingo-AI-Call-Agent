const { getPrisma } = require('../../data/prisma');
const Anthropic = require('@anthropic-ai/sdk');
const { buildSentimentTimeline } = require('./sentimentAnalyzer');
const { updatePerformance } = require('../performance/agentPerformanceService');

let client = null;

function getClient() {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

function countFillerWords(text = '') {
  const matches = text.match(/\b(um|uh|like|you know)\b/gi);
  return matches ? matches.length : 0;
}

function computeDurationSeconds(call, segments) {
  if (call?.duration_seconds) return Number(call.duration_seconds);
  if (!segments.length) return 0;
  const first = segments[0];
  const last = segments[segments.length - 1];
  return Math.max(Math.round((Number(last.end_ms || 0) - Number(first.start_ms || 0)) / 1000), 0);
}

function calculateBasicMetrics(segments = []) {
  const transcriptText = segments.map((segment) => segment.text || '').join(' ');
  const agentTime = segments.filter((segment) => segment.speaker === 'AGENT').reduce((sum, segment) => sum + Math.max(Number(segment.end_ms || 0) - Number(segment.start_ms || 0), 0), 0);
  const contactTime = segments.filter((segment) => segment.speaker === 'CONTACT').reduce((sum, segment) => sum + Math.max(Number(segment.end_ms || 0) - Number(segment.start_ms || 0), 0), 0);
  const totalTime = Math.max(agentTime + contactTime, 1);
  const wordCount = transcriptText ? transcriptText.split(/\s+/).filter(Boolean).length : 0;
  const durationMinutes = Math.max(totalTime / 60000, 1 / 60);
  const avgSpeakingSpeed = Math.round(wordCount / durationMinutes);
  const longestMonologue = segments.reduce((max, segment) => Math.max(max, Math.max(Number(segment.end_ms || 0) - Number(segment.start_ms || 0), 0)), 0);
  const interruptions = segments.filter((segment) => segment.is_objection).length;

  return {
    transcriptText,
    wordCount,
    talkRatioAgent: agentTime / totalTime,
    talkRatioContact: contactTime / totalTime,
    fillerWordCount: countFillerWords(transcriptText),
    avgSpeakingSpeed,
    longestMonologue: Math.round(longestMonologue / 1000),
    interruptions,
  };
}

async function generateScorecard(callId) {
  const prisma = getPrisma();
  const call = await prisma.humanCall.findUnique({
    where: { id: callId },
    include: {
      transcript: { include: { segments: true } },
      segments: true,
      campaign: true,
      contact: true,
      organization: true,
    },
  });

  if (!call) {
    throw new Error(`Human call ${callId} not found`);
  }

  const segments = call.transcript?.segments?.length ? call.transcript.segments : call.segments || [];
  const metrics = calculateBasicMetrics(segments);
  const scriptSummary = call.campaign?.metadata?.goal || call.campaign?.name || 'Unknown goal';
  const outcome = call.outcome || 'unknown';
  const duration = computeDurationSeconds(call, segments);

  const response = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: 'You are an expert sales coach analyzing a completed sales call. Return ONLY valid JSON.',
    messages: [
      {
        role: 'user',
        content: `Campaign Goal: ${scriptSummary}
Script: ${JSON.stringify(call.campaign?.metadata || {})}
Duration: ${duration}
Outcome: ${outcome}
Talk ratio: Agent ${Math.round(metrics.talkRatioAgent * 100)}% / Contact ${Math.round(metrics.talkRatioContact * 100)}%
Speaking speed: ${metrics.avgSpeakingSpeed} wpm avg
Filler words: ${metrics.fillerWordCount}

Full Transcript:
${metrics.transcriptText}

Score 1-10 on:
- opening (first 60 seconds)
- objection_handling
- rapport_building
- script_adherence
- closing_technique

Provide:
- overall_score (weighted average)
- what_went_well (array of 3-5 specific observations with timestamps)
- what_to_improve (array of 3-5 specific issues with timestamps)
- coaching_tips (array of 3 actionable tips)
- one_line_summary

Return ONLY valid JSON.`,
      },
    ],
  });

  const raw = response?.content?.[0]?.text || '{}';
  const parsed = JSON.parse(raw);
  const sentimentTimeline = buildSentimentTimeline(segments);
  const scorecard = await prisma.callScorecard.upsert({
    where: { call_id: callId },
    update: {
      agent_id: call.agent_id,
      org_id: call.org_id,
      overall_score: Number(parsed.overall_score || 0),
      opening_score: Number(parsed.opening_score || parsed.scores?.opening || 0),
      objection_handling_score: Number(parsed.objection_handling_score || parsed.scores?.objection_handling || 0),
      rapport_score: Number(parsed.rapport_score || parsed.scores?.rapport_building || 0),
      script_adherence_score: Number(parsed.script_adherence_score || parsed.scores?.script_adherence || 0),
      closing_score: Number(parsed.closing_score || parsed.scores?.closing_technique || 0),
      what_went_well: parsed.what_went_well || [],
      what_to_improve: parsed.what_to_improve || [],
      coaching_tips: parsed.coaching_tips || [],
      summary: parsed.one_line_summary || parsed.summary || '',
      sentiment_timeline: parsed.sentiment_timeline || sentimentTimeline,
      talk_speed_avg: metrics.avgSpeakingSpeed,
      filler_word_count: metrics.fillerWordCount,
      longest_monologue_sec: metrics.longestMonologue,
      interruptions_count: metrics.interruptions,
      ai_model_used: 'claude-sonnet-4-6',
      analysis_duration_ms: Number(parsed.analysis_duration_ms || 0),
    },
    create: {
      call_id: callId,
      agent_id: call.agent_id,
      org_id: call.org_id,
      overall_score: Number(parsed.overall_score || 0),
      opening_score: Number(parsed.opening_score || parsed.scores?.opening || 0),
      objection_handling_score: Number(parsed.objection_handling_score || parsed.scores?.objection_handling || 0),
      rapport_score: Number(parsed.rapport_score || parsed.scores?.rapport_building || 0),
      script_adherence_score: Number(parsed.script_adherence_score || parsed.scores?.script_adherence || 0),
      closing_score: Number(parsed.closing_score || parsed.scores?.closing_technique || 0),
      what_went_well: parsed.what_went_well || [],
      what_to_improve: parsed.what_to_improve || [],
      coaching_tips: parsed.coaching_tips || [],
      summary: parsed.one_line_summary || parsed.summary || '',
      sentiment_timeline: parsed.sentiment_timeline || sentimentTimeline,
      talk_speed_avg: metrics.avgSpeakingSpeed,
      filler_word_count: metrics.fillerWordCount,
      longest_monologue_sec: metrics.longestMonologue,
      interruptions_count: metrics.interruptions,
      ai_model_used: 'claude-sonnet-4-6',
      analysis_duration_ms: Number(parsed.analysis_duration_ms || 0),
    },
  });

  await updatePerformance(call.agent_id, call.org_id, scorecard);
  return scorecard;
}

module.exports = { generateScorecard, calculateBasicMetrics, countFillerWords };
