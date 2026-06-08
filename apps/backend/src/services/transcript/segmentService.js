const { getPrisma } = require('../../data/prisma');

async function saveSegment(callId, segment) {
  return getPrisma().transcriptSegment.create({
    data: {
      call_id: callId,
      transcript_id: segment.transcriptId || null,
      speaker: segment.speaker || 'UNKNOWN',
      text: segment.text || '',
      start_ms: segment.startMs || 0,
      end_ms: segment.endMs || 0,
      confidence: Number(segment.confidence || 0),
      sentiment_score: Number(segment.sentimentScore || 0),
      words_per_min: segment.wordsPerMin || null,
      is_objection: Boolean(segment.isObjection),
      objection_type: segment.objectionType || null,
    },
  });
}

async function listSegments(callId) {
  return getPrisma().transcriptSegment.findMany({
    where: { call_id: callId },
    orderBy: { start_ms: 'asc' },
  });
}

function buildTranscriptText(segments = []) {
  return segments.map((segment) => segment.text).join(' ').trim();
}

module.exports = { saveSegment, listSegments, buildTranscriptText };
