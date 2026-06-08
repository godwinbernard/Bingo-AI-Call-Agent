const Anthropic = require('@anthropic-ai/sdk');

let client = null;

function getClient() {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

function safeParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error('Invalid JSON from objection detector');
  }
}

async function detect({ lastUtterance, recentContext = [], callId }) {
  const response = await getClient().messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 200,
    system: 'You detect sales objections in real-time calls. Always respond in JSON.',
    messages: [
      {
        role: 'user',
        content: `Contact just said: ${lastUtterance}\nRecent context: ${recentContext.join('\n')}\nCall ID: ${callId}\n\nDetect if this is an objection.\n\nReturn JSON only:\n{\n  "is_objection": boolean,\n  "type": "too_busy|price|not_interested|need_to_think|competitor|timing|trust|other" | null,\n  "suggested_response": string | null,\n  "confidence": number (0-1)\n}`,
      },
    ],
  });

  const rawText = response?.content?.[0]?.text || '{}';
  const parsed = safeParseJson(rawText);

  return {
    isObjection: Boolean(parsed.is_objection),
    type: parsed.type || null,
    suggestedResponse: parsed.suggested_response || null,
    confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0,
  };
}

module.exports = { detect };
