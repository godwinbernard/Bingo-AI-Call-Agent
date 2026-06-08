jest.mock('twilio', () => {
  const calls = {
    create: jest.fn(),
  };

  const client = { calls };

  class VoiceResponse {
    constructor() {
      this.parts = [];
    }

    dial(attrs, callback) {
      this.parts.push({ type: 'dial', attrs, callback });
    }

    toString() {
      const dial = this.parts.find((part) => part.type === 'dial');
      return `<Response><Dial>${dial?.callback || ''}</Dial></Response>`;
    }
  }

  class VoiceGrant {
    constructor(options) {
      this.options = options;
    }
  }

  class AccessToken {
    constructor(accountSid, apiKeySid, apiKeySecret, options) {
      this.accountSid = accountSid;
      this.apiKeySid = apiKeySid;
      this.apiKeySecret = apiKeySecret;
      this.options = options;
      this.grants = [];
    }

    addGrant(grant) {
      this.grants.push(grant);
    }

    toJwt() {
      return 'test.jwt.token';
    }
  }

  return Object.assign(
    jest.fn(() => client),
    {
      __client: client,
      twiml: { VoiceResponse },
      jwt: { AccessToken, VoiceGrant },
    }
  );
});

describe('twilioVoiceService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      TWILIO_ACCOUNT_SID: 'AC123',
      TWILIO_AUTH_TOKEN: 'auth',
      TWILIO_API_KEY_SID: 'SK123',
      TWILIO_API_KEY_SECRET: 'secret',
      TWILIO_TWIML_APP_SID: 'AP123',
      TWILIO_CALLER_ID: '+15555550100',
      BASE_URL: 'https://example.com',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it('generates a Twilio access token with voice grants', () => {
    const { generateAccessToken } = require('../../src/services/dialer/twilioVoiceService');
    const token = generateAccessToken('member_1', 'org_1');

    expect(token).toBe('test.jwt.token');
  });

  it('creates an outbound call with recording enabled', async () => {
    const twilio = require('twilio');
    twilio.__client.calls.create.mockResolvedValue({ sid: 'CA123' });

    const { initiateCall } = require('../../src/services/dialer/twilioVoiceService');
    const result = await initiateCall({
      to: '+12025550100',
      from: '+15555550100',
      agentId: 'member_1',
      contactId: 'contact_1',
      campaignId: 'campaign_1',
      orgId: 'org_1',
      recordingEnabled: true,
    });

    expect(result).toBe('CA123');
    expect(twilio.__client.calls.create).toHaveBeenCalledWith(
      expect.objectContaining({
        to: '+12025550100',
        from: '+15555550100',
        record: true,
      })
    );
  });

  it('generates TwiML for agent browser dial-in', () => {
    const { generateTwiML } = require('../../src/services/dialer/twilioVoiceService');
    const twiml = generateTwiML({ agentCallSid: 'CA123', recordingEnabled: true });

    expect(twiml).toContain('<Dial');
    expect(twiml).toContain('record');
    expect(twiml).toContain('CA123');
  });
});
