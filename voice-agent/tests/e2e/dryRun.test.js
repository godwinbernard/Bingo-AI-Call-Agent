const fs = require('fs');
const path = require('path');
const { InMemoryPool } = require('../helpers/inMemoryDb');
const { InMemoryRedis } = require('../helpers/inMemoryRedis');
const { createTwilioMock } = require('../mocks/twilioMock');
const { createDeepgramMock } = require('../mocks/deepgramMock');
const { createElevenLabsMock } = require('../mocks/elevenLabsMock');
const { createClaudeMock } = require('../mocks/claudeMock');

function loadDryRun() {
  jest.resetModules();
  process.env.ELEVENLABS_API_KEY = 'test-key';
  process.env.ELEVENLABS_VOICE_ID = 'voice-test';
  const pool = new InMemoryPool();
  const redis = new InMemoryRedis();
  const twilioMock = createTwilioMock({ outcomes: ['answered', 'answered', 'voicemail', 'no_answer', 'answered'] });
  const deepgramMock = createDeepgramMock({ transcripts: ['Yes that sounds good', 'Not interested thanks'] });
  const elevenLabsMock = createElevenLabsMock({ failEvery: 0 });
  const claudeMock = createClaudeMock({ goalAchievedAfter: 1 });

  jest.doMock('pg', () => ({
    Pool: jest.fn(() => pool),
  }));
  jest.doMock('ioredis', () => jest.fn(() => redis));
  jest.doMock('twilio', () => twilioMock);
  jest.doMock('@deepgram/sdk', () => deepgramMock);
  jest.doMock('@anthropic-ai/sdk', () => jest.fn(() => claudeMock.client));
  jest.doMock('axios', () => elevenLabsMock.axiosModuleMock());

  return {
    pool,
    redis,
    twilioMock,
    deepgramMock,
    elevenLabsMock,
    claudeMock,
    harness: require('../helpers/dryRunHarness'),
  };
}

describe('dry run e2e', () => {
  const csvPath = path.join(__dirname, '../fixtures/test_numbers.csv');
  const scriptPath = path.join(__dirname, '../fixtures/test_script.json');
  const dncPath = path.join(__dirname, '../fixtures/test_dnc.txt');

  afterEach(() => {
    const errorsLog = path.join(process.cwd(), 'errors.log');
    if (fs.existsSync(errorsLog)) {
      fs.rmSync(errorsLog);
    }
  });

  test('runs full campaign start to finish in dry run mode', async () => {
    const { pool, twilioMock, deepgramMock, harness } = loadDryRun();

    const result = await harness.runDryCampaign({
      csvPath,
      scriptPath,
      dncPath,
      campaignId: 'dry-run-e2e',
      twilioFactory: twilioMock,
      deepgramClient: deepgramMock.createClient(),
      elevenLabsMock: { enabled: true },
    });

    expect(result.summary.total).toBe(5);
    expect(result.summary.skipped).toBe(1);
    expect(pool.callLogs).toHaveLength(5);
    expect(pool.callLogs.every((entry) => entry.outcome)).toBe(true);
    expect(fs.existsSync(path.join(process.cwd(), 'errors.log'))).toBe(false);
  });

  test('prints a summary table at the end', async () => {
    const { harness } = loadDryRun();
    const summary = harness.formatSummaryTable({
      total: 5,
      dialed: 4,
      skipped: 1,
      answered: 2,
      voicemail: 1,
      no_answer: 1,
      success: 1,
      rejected: 1,
      errors: 0,
      duration: 12.3,
    });

    expect(summary).toContain('DRY RUN SUMMARY');
    expect(summary).toContain('Total');
    expect(summary).toContain('Duration');
  });
});
