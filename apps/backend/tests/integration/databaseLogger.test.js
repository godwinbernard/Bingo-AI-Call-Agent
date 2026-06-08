const { InMemoryPool } = require('../helpers/inMemoryDb');

describe('databaseLogger', () => {
  function loadLogger(pool) {
    jest.doMock('pg', () => ({
      Pool: jest.fn(() => pool),
    }));
    return require('../../src/data/callLogger');
  }

  beforeEach(() => {
    jest.resetModules();
  });

  test('creates schema on first run', async () => {
    const pool = new InMemoryPool();
    const { ensureSchema } = loadLogger(pool);

    await expect(ensureSchema()).resolves.toBe(true);
    expect(pool.schemaCreated).toBe(true);
  });

  test('logs all required fields per call', async () => {
    const pool = new InMemoryPool();
    const { logCallStart, updateCallStatus, getCallLog } = loadLogger(pool);

    await logCallStart({
      callSid: 'CA00000000000000000000000000000001',
      campaignId: 'campaign-one',
      phoneNumber: '+15005550001',
      contactName: 'Test User One',
    });

    await updateCallStatus('CA00000000000000000000000000000001', {
      status: 'completed',
      outcome: 'success',
      duration_seconds: 12,
    });

    const row = await getCallLog('CA00000000000000000000000000000001');
    expect(row).toMatchObject({
      call_sid: 'CA00000000000000000000000000000001',
      campaign_id: 'campaign-one',
      phone_number: '+15005550001',
      contact_name: 'Test User One',
      status: 'completed',
      outcome: 'success',
      duration_seconds: 12,
    });
  });

  test('saves full transcript as JSON', async () => {
    const pool = new InMemoryPool();
    const { logCallStart, updateCallStatus, getCallLog } = loadLogger(pool);

    await logCallStart({
      callSid: 'CA00000000000000000000000000000002',
      campaignId: 'campaign-two',
      phoneNumber: '+15005550002',
      contactName: 'Test User Two',
    });

    const transcript = [
      { role: 'user', content: 'Yes that sounds good' },
      { role: 'assistant', content: 'Perfect!' },
    ];

    await updateCallStatus('CA00000000000000000000000000000002', {
      status: 'completed',
      outcome: 'success',
      transcript,
    });

    const row = await getCallLog('CA00000000000000000000000000000002');
    expect(row.transcript).toEqual(transcript);
  });

  test('handles DB connection failure gracefully', async () => {
    const pool = new InMemoryPool();
    pool.query = jest.fn().mockRejectedValue(new Error('database down'));
    const { ensureSchema, logCallStart, getCampaignStats } = loadLogger(pool);

    await expect(ensureSchema()).resolves.toBe(false);
    await expect(
      logCallStart({
        callSid: 'CAFAIL',
        campaignId: 'campaign-fail',
        phoneNumber: '+15005550003',
        contactName: 'Broken Record',
      })
    ).resolves.toBeUndefined();

    await expect(getCampaignStats('campaign-fail')).resolves.toEqual({
      total: 0,
      completed: 0,
      failed: 0,
      voicemails: 0,
      avg_duration: null,
    });
  });

  test('query campaign status returns correct counts', async () => {
    const pool = new InMemoryPool();
    const { logCallStart, updateCallStatus, getCampaignStats } = loadLogger(pool);

    await logCallStart({
      callSid: 'CA00000000000000000000000000000003',
      campaignId: 'campaign-stats',
      phoneNumber: '+15005550004',
      contactName: 'Test User Three',
    });
    await updateCallStatus('CA00000000000000000000000000000003', {
      status: 'completed',
      outcome: 'success',
      duration_seconds: 10,
    });

    await logCallStart({
      callSid: 'CA00000000000000000000000000000004',
      campaignId: 'campaign-stats',
      phoneNumber: '+15005550005',
      contactName: 'Test User Four',
    });
    await updateCallStatus('CA00000000000000000000000000000004', {
      status: 'failed',
      outcome: 'no_answer',
      duration_seconds: 0,
    });

    const stats = await getCampaignStats('campaign-stats');
    expect(stats.total).toBe(2);
    expect(stats.completed).toBe(1);
    expect(stats.failed).toBe(1);
  });
});
