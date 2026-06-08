const REMOVE_KEYWORDS = [
  'remove me', 'take me off', 'dont call', "don't call", 'stop calling',
  'not interested', 'do not call', 'remove my number', 'unsubscribe',
];

const HUMAN_QUESTION_KEYWORDS = [
  'are you a robot', 'are you human', 'are you real', 'is this a bot',
  'am i talking to a bot', 'is this automated', 'real person', 'speak to a human',
  'talk to a person',
];

function detectRemovalRequest(text) {
  const lower = text.toLowerCase();
  return REMOVE_KEYWORDS.some((kw) => lower.includes(kw));
}

function detectHumanQuestion(text) {
  const lower = text.toLowerCase();
  return HUMAN_QUESTION_KEYWORDS.some((kw) => lower.includes(kw));
}

function getRemovalResponse(agentName = 'Alex') {
  return `Of course, I'll make sure to remove your number from our list right away. I apologize for any inconvenience, and I hope you have a wonderful day. Goodbye!`;
}

function getAIDisclosureResponse(agentName = 'Alex') {
  return `Yes, I am an AI voice agent named ${agentName}. I'm here to assist you and answer any questions you might have.`;
}

module.exports = {
  detectRemovalRequest,
  detectHumanQuestion,
  getRemovalResponse,
  getAIDisclosureResponse,
};
