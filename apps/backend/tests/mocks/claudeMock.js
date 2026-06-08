const DEFAULT_RESPONSES = [
  'I completely understand your concern. Our solution actually addresses that directly — would you like to hear how?',
  "That's a great question. Most of our clients felt the same way before they tried us. Can I share a quick example?",
  'Absolutely no problem at all. Thank you so much for your time today. Have a wonderful day!',
  "Perfect! I'll get that calendar invite sent over to you right now.",
];

function createClaudeMock(options = {}) {
  const state = {
    turns: 0,
    responses: [...(options.responses || DEFAULT_RESPONSES)],
    history: [],
  };

  const client = {
    messages: {
      create: async (payload) => {
        state.turns += 1;
        const responseText = state.responses[(state.turns - 1) % state.responses.length];
        const goalAchieved = options.goalAchievedAfter
          ? state.turns >= options.goalAchievedAfter
          : state.turns >= 5 && Math.random() > 0.5;
        const intent = /calendar invite|goodbye/i.test(responseText) ? 'end_call' : 'continue';
        const structured = {
          text: responseText,
          goal_achieved: goalAchieved,
          intent,
          history_length: payload?.messages?.length || 0,
        };

        state.history.push({ payload, structured });
        console.log('[CLAUDE MOCK]', JSON.stringify(structured));
        return {
          content: [
            {
              text: JSON.stringify(structured),
            },
          ],
        };
      },
    },
  };

  return {
    client,
    __state: state,
  };
}

module.exports = { createClaudeMock };
