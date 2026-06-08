const { setPrismaClient } = require('../../src/data/prisma');

describe('sessionService', () => {
  const prismaMock = {
    dialerSession: {
      create: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(() => {
    setPrismaClient(prismaMock);
    jest.clearAllMocks();
  });

  it('creates an active session', async () => {
    prismaMock.dialerSession.create.mockResolvedValue({ id: 'session_1', status: 'ACTIVE' });
    const { createSession } = require('../../src/services/dialer/sessionService');

    const session = await createSession('agent_1', 'org_1', 'campaign_1');

    expect(session.id).toBe('session_1');
    expect(prismaMock.dialerSession.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          agent_id: 'agent_1',
          org_id: 'org_1',
          campaign_id: 'campaign_1',
          status: 'ACTIVE',
        }),
      })
    );
  });

  it('ends the active session and returns summary stats', async () => {
    prismaMock.dialerSession.update.mockResolvedValue({
      id: 'session_1',
      status: 'ENDED',
      calls_made: 3,
      started_at: new Date('2026-06-07T10:00:00Z'),
      ended_at: new Date('2026-06-07T11:00:00Z'),
    });
    prismaMock.dialerSession.findUnique.mockResolvedValue({
      id: 'session_1',
      calls_made: 3,
      started_at: new Date('2026-06-07T10:00:00Z'),
      ended_at: new Date('2026-06-07T11:00:00Z'),
    });

    const { endSession } = require('../../src/services/dialer/sessionService');
    const result = await endSession('session_1');

    expect(result.status).toBe('ENDED');
    expect(result.calls_made).toBe(3);
  });
});
