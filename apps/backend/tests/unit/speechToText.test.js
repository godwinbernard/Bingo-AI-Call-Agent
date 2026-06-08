let mockDeepgramClient;

jest.mock('@deepgram/sdk', () => ({
  createClient: jest.fn(() => mockDeepgramClient),
}));

function loadModule() {
  return require('../../src/voice/speechToText');
}

function createClientMock(transcribeImpl) {
  return {
    listen: {
      prerecorded: {
        transcribeUrl: transcribeImpl,
      },
    },
  };
}

describe('speechToText', () => {
  beforeEach(() => {
    jest.resetModules();
    mockDeepgramClient = undefined;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('returns transcript string on success', async () => {
    mockDeepgramClient = createClientMock(jest.fn().mockResolvedValue({
      result: {
        results: {
          channels: [
            {
              alternatives: [
                {
                  transcript: 'Yes that sounds good',
                  confidence: 0.92,
                  words: [],
                },
              ],
            },
          ],
        },
      },
      error: null,
    }));

    const { transcribeUrl } = loadModule();
    const result = await transcribeUrl('https://example.com/audio.wav');

    expect(result.text).toBe('Yes that sounds good');
    expect(result.confidence).toBeGreaterThanOrEqual(0);
  });

  test('returns confidence score between 0 and 1', async () => {
    mockDeepgramClient = createClientMock(jest.fn().mockResolvedValue({
      result: {
        results: {
          channels: [
            {
              alternatives: [
                {
                  transcript: 'How much does it cost',
                  confidence: 0.71,
                  words: [],
                },
              ],
            },
          ],
        },
      },
      error: null,
    }));

    const { transcribeUrl } = loadModule();
    const result = await transcribeUrl('https://example.com/audio.wav');
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  test('triggers repeat request if confidence < 0.6', async () => {
    mockDeepgramClient = createClientMock(jest.fn().mockResolvedValue({
      result: {
        results: {
          channels: [
            {
              alternatives: [
                {
                  transcript: 'Maybe',
                  confidence: 0.4,
                  words: [],
                },
              ],
            },
          ],
        },
      },
      error: null,
    }));

    const { transcribeUrl, shouldRepeatPrompt } = loadModule();
    const result = await transcribeUrl('https://example.com/audio.wav');
    expect(result.shouldRepeat).toBe(true);
    expect(shouldRepeatPrompt(result)).toBe(true);
  });

  test('handles silence timeout after 5 seconds', async () => {
    jest.useFakeTimers();
    mockDeepgramClient = createClientMock(jest.fn(() => new Promise(() => {})));

    const { transcribeUrl } = loadModule();
    const promise = transcribeUrl('https://example.com/audio.wav', { timeoutMs: 5000 });
    await jest.advanceTimersByTimeAsync(5000);
    await expect(promise).resolves.toMatchObject({
      text: '',
      confidence: 0,
      error: expect.stringContaining('Silence timeout'),
    });
  });

  test('handles Deepgram connection failure', async () => {
    mockDeepgramClient = createClientMock(jest.fn().mockRejectedValue(new Error('connection failed')));

    const { transcribeUrl } = loadModule();
    const result = await transcribeUrl('https://example.com/audio.wav');
    expect(result.error).toContain('connection failed');
  });
});
