const crypto = require('crypto');

const DEFAULT_OUTCOMES = ['answered', 'answered', 'voicemail', 'no_answer', 'busy'];

function generateCallSid() {
  return `CA${crypto.randomBytes(16).toString('hex').toUpperCase()}`;
}

function pickOutcome(state) {
  if (state.outcomeQueue.length > 0) {
    return state.outcomeQueue.shift();
  }

  const roll = Math.random() * 100;
  if (roll < 60) return 'answered';
  if (roll < 85) return 'voicemail';
  if (roll < 95) return 'no_answer';
  return 'busy';
}

function createTwilioMock(options = {}) {
  const state = {
    calls: [],
    updates: [],
    callbacks: [],
    outcomeQueue: [...(options.outcomes || DEFAULT_OUTCOMES)],
  };

  function calls(sid) {
    return {
      update: async (payload) => {
        state.updates.push({ sid, payload });
        console.log('[TWILIO MOCK]', JSON.stringify({ sid, payload, type: 'update' }));
        return { sid, ...payload };
      },
    };
  }

  calls.create = async (payload) => {
    const sid = generateCallSid();
    const outcome = pickOutcome(state);
    const record = { sid, outcome, payload };
    state.calls.push(record);
    console.log('[TWILIO MOCK]', JSON.stringify(record));

    if (payload?.statusCallback) {
      setTimeout(() => {
        state.callbacks.push({
          sid,
          url: payload.statusCallback,
          event: outcome,
          answeringMachine: outcome === 'voicemail',
        });
      }, 500);
    }

    return {
      sid,
      status: outcome === 'answered' ? 'in-progress' : outcome,
      answeredBy: outcome === 'voicemail' ? 'machine_end_beep' : 'human',
      outcome,
    };
  };

  const client = { calls };

  function twilioModuleFactory() {
    return client;
  }

  twilioModuleFactory.__state = state;
  twilioModuleFactory.__client = client;
  return twilioModuleFactory;
}

module.exports = { createTwilioMock, generateCallSid };
