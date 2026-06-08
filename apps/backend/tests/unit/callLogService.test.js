jest.mock('../../src/services/ai/scorecardGenerator', () => ({
  generateScorecard: jest.fn().mockResolvedValue({ id: 'scorecard_1' }),
}));

jest.mock('../../src/services/performance/agentPerformanceService', () => ({
  updatePerformance: jest.fn().mockResolvedValue({ id: 'performance_1' }),
}));

const { setPrismaClient } = require('../../src/data/prisma');

describe('callLogService', () => {
  const prismaMock = {
    humanCall: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(() => {
    setPrismaClient(prismaMock);
    jest.clearAllMocks();
  });

  it('creates an initiated human call', async () => {
    prismaMock.humanCall.create.mockResolvedValue({ id: 'call_1', status: 'INITIATED' });
    const { createCallLog } = require('../../src/services/dialer/callLogService');

    const call = await createCallLog({
      orgId: 'org_1',
      agentId: 'agent_1',
      contactId: 'contact_1',
      campaignId: 'campaign_1',
      twilioCallSid: 'CA123',
      direction: 'OUTBOUND',
    });

    expect(call.status).toBe('INITIATED');
    expect(prismaMock.humanCall.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          org_id: 'org_1',
          agent_id: 'agent_1',
          contact_id: 'contact_1',
          campaign_id: 'campaign_1',
          twilio_call_sid: 'CA123',
          status: 'INITIATED',
        }),
      })
    );
  });

  it('logs an outcome and triggers scorecard generation', async () => {
    prismaMock.humanCall.update.mockResolvedValue({ id: 'call_1', outcome: 'SUCCESS' });
    const { logOutcome } = require('../../src/services/dialer/callLogService');

    const result = await logOutcome('call_1', 'SUCCESS', 'booked demo');

    expect(result.outcome).toBe('SUCCESS');
    expect(prismaMock.humanCall.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'call_1' },
      })
    );
  });
});
