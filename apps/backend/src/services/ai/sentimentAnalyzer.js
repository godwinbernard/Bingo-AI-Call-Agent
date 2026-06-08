const Anthropic = require('@anthropic-ai/sdk');
const { getClient: getRedisClient } = require('../../state/redisManager');

let client = null;

function getClient() {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

async function analyzeSentiment(text) {
  if (!text || !text.trim()) {
    return 0.5;
  }

  const redis = getRedisClient();
  const cacheKey = `sentiment:${Buffer.from(text).toString('base64')}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached !== null) {
      return Number(cached);
    }
  } catch {
    // ignore cache failures
  }

  try {
    const response = await getClient().messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 40,
      system: 'Return only a number between 0.0 and 1.0 representing sentiment. 0.0 is very negative, 0.5 neutral, 1.0 very positive.',
      messages: [{ role: 'user', content: text }],
    });

    const raw = response?.content?.[0]?.text?.trim() || '0.5';
    const score = Math.min(1, Math.max(0, Number(raw.replace(/[^\d.]/g, '')) || 0.5));

    try {
      await redis.set(cacheKey, String(score), 'EX', 300);
    } catch {
      // ignore cache failures
    }

    return score;
  } catch {
    return 0.5;
  }
}

function buildSentimentTimeline(segments = []) {
  let elapsed = 0;
  return segments.map((segment) => {
    elapsed += Math.max(Number(segment.end_ms || 0) - Number(segment.start_ms || 0), 0);
    return {
      time_ms: elapsed,
      score: Number(segment.sentiment_score || 0),
    };
  });
}

module.exports = { analyzeSentiment, buildSentimentTimeline };
