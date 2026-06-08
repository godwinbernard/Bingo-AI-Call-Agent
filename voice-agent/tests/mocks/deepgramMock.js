const DEFAULT_TRANSCRIPTS = [
  'Yes that sounds good',
  "I'm too busy right now",
  'How much does it cost',
  'Not interested thanks',
  'Tell me more about that',
  'Can you call back later',
];

function createDeepgramMock(options = {}) {
  const state = {
    transcripts: [...(options.transcripts || DEFAULT_TRANSCRIPTS)],
    calls: [],
  };

  const client = {
    listen: {
      prerecorded: {
        transcribeUrl: async (_input, _config) => {
          const transcript = state.transcripts[state.calls.length % state.transcripts.length];
          const confidence = Number((0.7 + Math.random() * 0.29).toFixed(2));
          state.calls.push({ transcript, confidence });
          console.log('[DEEPGRAM MOCK]', JSON.stringify({ transcript, confidence }));
          await delay(300);
          return {
            result: {
              results: {
                channels: [
                  {
                    alternatives: [
                      {
                        transcript,
                        confidence,
                        words: [],
                      },
                    ],
                  },
                ],
              },
            },
            error: null,
          };
        },
      },
    },
  };

  return {
    createClient: () => client,
    __state: state,
    __client: client,
  };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { createDeepgramMock };
