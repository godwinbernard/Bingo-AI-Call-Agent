function createElevenLabsMock(options = {}) {
  const state = {
    calls: 0,
    failures: 0,
    failEvery: options.failEvery || 10,
  };

  async function synthesize(text, voiceId) {
    state.calls += 1;
    console.log('[ELEVENLABS MOCK]', JSON.stringify({ call: state.calls, voiceId, text }));
    await delay(options.delayMs || 200);

    if (state.failEvery > 0 && state.calls % state.failEvery === 0) {
      state.failures += 1;
      throw new Error('Simulated ElevenLabs failure');
    }

    return Buffer.alloc(0);
  }

  function axiosModuleMock() {
    return {
      post: async (url, body) => {
        const voiceId = String(url).split('/').pop();
        const data = await synthesize(body?.text || '', voiceId);
        return { data };
      },
    };
  }

  return {
    synthesize,
    axiosModuleMock,
    __state: state,
  };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { createElevenLabsMock };
