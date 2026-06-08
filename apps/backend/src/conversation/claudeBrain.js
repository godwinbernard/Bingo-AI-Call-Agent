const Anthropic = require('@anthropic-ai/sdk');
const { detectRemovalRequest, detectHumanQuestion, getRemovalResponse, getAIDisclosureResponse } = require('./objectionHandler');

const MAX_TURNS = 15;
const MAX_SENTENCES = 2;

let anthropicClient = null;

function getClient() {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

function buildConversationHistory(messages = [], userInput) {
  return [...messages, { role: 'user', content: userInput }];
}

function detectGoalAchieved(text = '') {
  const lower = text.toLowerCase();
  return lower.includes('goal_achieved: true') || lower.includes('"goal_achieved":true') || lower.includes('goal achieved');
}

function detectEndCallIntent(text = '') {
  const lower = text.toLowerCase();
  return lower.includes('end_call') || lower.includes('goodbye') || lower.includes('have a wonderful day') || lower.includes('have a great day');
}

function keepUnderSentenceLimit(text = '') {
  const parts = text
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
  if (parts.length <= MAX_SENTENCES) {
    return text.trim();
  }
  return `${parts.slice(0, MAX_SENTENCES).join(' ').trim()}`.replace(/\s+/g, ' ');
}

function sanitizeResponse(text, agentName) {
  const safeText = keepUnderSentenceLimit(text);
  if (/\b(i am|i'm)\s+a\s+human\b/i.test(safeText)) {
    return getAIDisclosureResponse(agentName);
  }
  return safeText;
}

function parseClaudeContent(response) {
  const rawText = response?.content?.[0]?.text || '';
  const trimmed = rawText.trim();

  if (!trimmed.startsWith('{')) {
    return {
      text: rawText,
      goalAchieved: detectGoalAchieved(rawText),
      intent: detectEndCallIntent(rawText) ? 'end_call' : 'continue',
    };
  }

  try {
    const parsed = JSON.parse(trimmed);
    return {
      text: typeof parsed.text === 'string' ? parsed.text : rawText,
      goalAchieved: Boolean(parsed.goal_achieved),
      intent: parsed.intent || (parsed.goal_achieved ? 'end_call' : 'continue'),
    };
  } catch {
    return {
      text: rawText,
      goalAchieved: detectGoalAchieved(rawText),
      intent: detectEndCallIntent(rawText) ? 'end_call' : 'continue',
    };
  }
}

async function generateResponse(session, userInput) {
  const { messages = [], systemPrompt, agentName, turnCount = 0 } = session;

  if (detectHumanQuestion(userInput)) {
    return { text: getAIDisclosureResponse(agentName), shouldEnd: false, isCompliance: true, intent: 'disclosure' };
  }

  if (detectRemovalRequest(userInput)) {
    return { text: getRemovalResponse(agentName), shouldEnd: true, outcome: 'dnc_requested', intent: 'end_call' };
  }

  if (turnCount >= MAX_TURNS) {
    return {
      text: 'Thank you so much for your time today. I really appreciate it. Have a wonderful day! Goodbye!',
      shouldEnd: true,
      outcome: 'max_turns_reached',
      intent: 'end_call',
    };
  }

  const conversationMessages = buildConversationHistory(messages, userInput);

  try {
    const client = getClient();
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 150,
      system: systemPrompt,
      messages: conversationMessages,
    });

    const parsed = parseClaudeContent(response);
    const text = sanitizeResponse(parsed.text, agentName);
    const shouldEnd = parsed.intent === 'end_call' || detectEndCallIntent(text);

    return {
      text,
      shouldEnd,
      intent: parsed.intent,
      goal_achieved: parsed.goalAchieved,
      outcome: shouldEnd ? 'natural_close' : null,
    };
  } catch (err) {
    console.error('[Claude] API error:', err.message);
    const fallbackText = session.script?.failure_close || session.fallbackResponse || "I'm sorry, I'm having a little trouble right now. Could I call you back at a better time?";
    return {
      text: fallbackText,
      shouldEnd: false,
      error: err.message,
      intent: 'fallback',
    };
  }
}

async function generateInitialGreeting(systemPrompt, openingMessage, agentName) {
  return {
    text: openingMessage,
    messages: [{ role: 'assistant', content: openingMessage }],
  };
}

module.exports = {
  generateResponse,
  generateInitialGreeting,
  buildConversationHistory,
  detectGoalAchieved,
  detectEndCallIntent,
  sanitizeResponse,
  parseClaudeContent,
  MAX_TURNS,
};
