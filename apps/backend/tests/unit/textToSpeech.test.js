jest.mock('axios', () => ({
  post: jest.fn(),
}));

const axios = require('axios');

const { synthesizeWithElevenLabs, getTwilioTTSElement } = require('../../src/voice/textToSpeech');

describe('textToSpeech', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ELEVENLABS_API_KEY = 'test-key';
    process.env.ELEVENLABS_VOICE_ID = 'voice-test';
  });

  test('returns audio buffer on success', async () => {
    axios.post.mockResolvedValue({ data: Buffer.from('audio') });

    const buffer = await synthesizeWithElevenLabs('Hello world');
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.toString()).toBe('audio');
  });

  test('falls back to Twilio Polly on failure', async () => {
    axios.post.mockRejectedValue(new Error('ElevenLabs down'));

    const twiml = await getTwilioTTSElement('Hello world');
    expect(twiml).toContain('<Say');
    expect(twiml).toContain('Hello world');
  });

  test('uses correct voice_id from env', async () => {
    axios.post.mockResolvedValue({ data: Buffer.from('audio') });

    await synthesizeWithElevenLabs('Hello world');
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/text-to-speech/voice-test'),
      expect.objectContaining({ text: 'Hello world' }),
      expect.objectContaining({ responseType: 'arraybuffer' })
    );
  });

  test('handles empty text input gracefully', async () => {
    await expect(synthesizeWithElevenLabs('')).resolves.toEqual(Buffer.alloc(0));
    await expect(getTwilioTTSElement('')).resolves.toContain('<Say');
  });
});
