const { getPrisma } = require('../../data/prisma');
const { listSegments, buildTranscriptText } = require('./segmentService');

async function upsertTranscript(callId, payload) {
  return getPrisma().callTranscript.upsert({
    where: { call_id: callId },
    update: payload,
    create: {
      call_id: callId,
      full_text: payload.full_text || '',
      word_count: payload.word_count || 0,
      talk_ratio_agent: payload.talk_ratio_agent || 0,
      talk_ratio_contact: payload.talk_ratio_contact || 0,
      filler_word_count: payload.filler_word_count || 0,
      avg_confidence: payload.avg_confidence || 0,
      avg_sentiment: payload.avg_sentiment || 0,
      keywords_detected: payload.keywords_detected || [],
      objections_detected: payload.objections_detected || [],
    },
  });
}

async function finalizeTranscript(callId) {
  const segments = await listSegments(callId);
  const text = buildTranscriptText(segments);
  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const talkAgent = segments.filter((segment) => segment.speaker === 'AGENT').reduce((sum, segment) => sum + Math.max(segment.end_ms - segment.start_ms, 0), 0);
  const talkContact = segments.filter((segment) => segment.speaker === 'CONTACT').reduce((sum, segment) => sum + Math.max(segment.end_ms - segment.start_ms, 0), 0);
  const totalTalk = Math.max(talkAgent + talkContact, 1);

  return upsertTranscript(callId, {
    full_text: text,
    word_count: wordCount,
    talk_ratio_agent: talkAgent / totalTalk,
    talk_ratio_contact: talkContact / totalTalk,
    filler_word_count: segments.filter((segment) => /\b(um|uh|like|you know)\b/i.test(segment.text)).length,
    avg_confidence: segments.length ? segments.reduce((sum, segment) => sum + Number(segment.confidence || 0), 0) / segments.length : 0,
    avg_sentiment: segments.length ? segments.reduce((sum, segment) => sum + Number(segment.sentiment_score || 0), 0) / segments.length : 0,
    keywords_detected: [],
    objections_detected: segments.filter((segment) => segment.is_objection).map((segment) => segment.objection_type || 'other'),
  });
}

async function getTranscript(callId) {
  return getPrisma().callTranscript.findUnique({
    where: { call_id: callId },
    include: { segments: true },
  });
}

module.exports = { upsertTranscript, finalizeTranscript, getTranscript };
