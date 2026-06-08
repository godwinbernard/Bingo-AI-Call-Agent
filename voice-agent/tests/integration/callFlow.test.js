const fs = require('fs');
const path = require('path');
const { InMemoryPool } = require('../helpers/inMemoryDb');
const { InMemoryRedis } = require('../helpers/inMemoryRedis');
const { createTwilioMock } = require('../mocks/twilioMock');
const { createDeepgramMock } = require('../mocks/deepgramMock');
const { createElevenLabsMock } = require('../mocks/elevenLabsMock');
const { createClaudeMock } = require('../mocks/claudeMock');

function loadSimulation({
  twilioOutcomes,
  transcripts,
  elevenLabsFailEvery = 0,
  responses,
  goalAchievedAfter = 1,
} = {}) {
  jest.resetModules();
  process.env.ELEVENLABS_API_KEY = 'test-key';
  process.env.ELEVENLABS_VOICE_ID = 'voice-test';
  const pool = new InMemoryPool();
  const redis = new InMemoryRedis();
  const twilioMock = createTwilioMock({ outcomes: twilioOutcomes });
  const deepgramMock = createDeepgramMock({ transcripts });
  const elevenLabsMock = createElevenLabsMock({ failEvery: elevenLabsFailEvery || 0 });
  const claudeMock = createClaudeMock({ responses, goalAchievedAfter });

  jest.doMock('pg', () => ({
    Pool: jest.fn(() => pool),
  }));
  jest.doMock('ioredis', () => jest.fn(() => redis));
  jest.doMock('twilio', () => twilioMock);
  jest.doMock('@deepgram/sdk', () => deepgramMock);
  jest.doMock('@anthropic-ai/sdk', () => jest.fn(() => claudeMock.client));
  jest.doMock('axios', () => elevenLabsMock.axiosModuleMock());

  const harness = require('../helpers/dryRunHarness');
  const speechToText = require('../../src/voice/speechToText');
  return { pool, redis, twilioMock, deepgramMock, elevenLabsMock, claudeMock, harness, speechToText };
}

describe('call flow integration', () => {
  const csvPath = path.join(__dirname, '../fixtures/test_numbers.csv');
  const scriptPath = path.join(__dirname, '../fixtures/test_script.json');
  const dncPath = path.join(__dirname, '../fixtures/test_dnc.txt');

  afterEach(() => {
    if (fs.existsSync(path.join(process.cwd(), 'errors.log'))) {
      fs.rmSync(path.join(process.cwd(), 'errors.log'));
    }
  });

  test('Test A: Happy Path', async () => {
    const { pool, twilioMock, deepgramMock, harness } = loadSimulation({
      twilioOutcomes: ['answered', 'voicemail', 'no_answer', 'answered'],
      transcripts: ['Yes that sounds good'],
      goalAchievedAfter: 1,
    });

    const result = await harness.runDryCampaign({
      csvPath,
      scriptPath,
      dncPath,
      campaignId: 'happy-path',
      twilioFactory: twilioMock,
      deepgramClient: deepgramMock.createClient(),
      elevenLabsMock: null,
    });

    const row = pool.callLogs.find((entry) => entry.campaign_id === 'happy-path' && entry.outcome === 'success');
    expect(result.summary.success).toBeGreaterThanOrEqual(1);
    expect(row).toBeTruthy();
    expect(row.transcript).toHaveLength(2);
    expect(Number(row.duration_seconds)).toBeGreaterThan(0);
  });

  test('Test B: Voicemail Path', async () => {
    const { pool, twilioMock, harness } = loadSimulation({
      twilioOutcomes: ['voicemail', 'no_answer', 'answered', 'answered'],
      transcripts: ['Tell me more about that'],
      goalAchievedAfter: 1,
    });

    await harness.runDryCampaign({
      csvPath,
      scriptPath,
      dncPath,
      campaignId: 'voicemail-path',
      twilioFactory: twilioMock,
      deepgramClient: createDeepgramMock().createClient(),
      elevenLabsMock: null,
    });

    const row = pool.callLogs.find((entry) => entry.campaign_id === 'voicemail-path');
    expect(row.outcome).toBe('voicemail');
    expect(row.answering_machine).toBe(true);
  });

  test('Test C: Rejection Path', async () => {
    const { pool, twilioMock, deepgramMock, harness } = loadSimulation({
      twilioOutcomes: ['answered', 'answered', 'voicemail', 'no_answer'],
      transcripts: ['Not interested thanks'],
      goalAchievedAfter: 5,
    });

    await harness.runDryCampaign({
      csvPath,
      scriptPath,
      dncPath,
      campaignId: 'rejection-path',
      twilioFactory: twilioMock,
      deepgramClient: deepgramMock.createClient(),
      elevenLabsMock: null,
    });

    const row = pool.callLogs.find((entry) => entry.campaign_id === 'rejection-path' && entry.outcome === 'rejected');
    expect(row).toBeTruthy();
  });

  test('Test D: No Answer Path', async () => {
    const { pool, twilioMock, harness } = loadSimulation({
      twilioOutcomes: ['no_answer', 'no_answer', 'answered', 'answered', 'answered'],
    });

    await harness.runDryCampaign({
      csvPath,
      scriptPath,
      dncPath,
      campaignId: 'no-answer-path',
      twilioFactory: twilioMock,
      deepgramClient: createDeepgramMock().createClient(),
      elevenLabsMock: null,
    });

    const row = pool.callLogs.find((entry) => entry.campaign_id === 'no-answer-path' && entry.outcome === 'no_answer');
    expect(row).toBeTruthy();
    expect(twilioMock.__state.calls.filter((call) => call.outcome === 'no_answer').length).toBeGreaterThanOrEqual(2);
  });

  test('Test E: ElevenLabs Failure Fallback', async () => {
    const { twilioMock, deepgramMock, harness } = loadSimulation({
      twilioOutcomes: ['answered', 'answered', 'voicemail', 'no_answer'],
      transcripts: ['Yes that sounds good'],
      elevenLabsFailEvery: 1,
      goalAchievedAfter: 1,
    });

    await harness.runDryCampaign({
      csvPath,
      scriptPath,
      dncPath,
      campaignId: 'fallback-path',
      twilioFactory: twilioMock,
      deepgramClient: deepgramMock.createClient(),
      elevenLabsMock: { enabled: true },
    });

    const errorLog = fs.readFileSync(path.join(process.cwd(), 'errors.log'), 'utf8');
    expect(errorLog).toContain('Simulated ElevenLabs failure');
  });

  test('Test F: DNC Skip', async () => {
    const { pool, twilioMock, deepgramMock, harness } = loadSimulation({
      twilioOutcomes: ['answered', 'answered', 'voicemail', 'no_answer'],
      transcripts: ['Yes that sounds good'],
      goalAchievedAfter: 1,
    });

    await harness.runDryCampaign({
      csvPath,
      scriptPath,
      dncPath,
      campaignId: 'dnc-path',
      twilioFactory: twilioMock,
      deepgramClient: deepgramMock.createClient(),
      elevenLabsMock: null,
    });

    expect(twilioMock.__state.calls.some((call) => call.payload.to === '+15005550003')).toBe(false);
    const skipped = pool.callLogs.find((entry) => entry.outcome === 'DNC');
    expect(skipped).toBeTruthy();
  });
});
