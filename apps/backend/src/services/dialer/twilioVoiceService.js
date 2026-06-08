const twilio = require('twilio');

let client = null;

function getClient() {
  if (!client) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return client;
}

function getTwilioVoiceGrantClass() {
  return twilio.jwt?.VoiceGrant || twilio.jwt?.AccessToken?.VoiceGrant;
}

function getAccessTokenClass() {
  return twilio.jwt?.AccessToken;
}

function buildBaseUrl() {
  return process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
}

function generateAccessToken(agentId, orgId) {
  const AccessToken = getAccessTokenClass();
  const VoiceGrant = getTwilioVoiceGrantClass();

  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY_SID,
    process.env.TWILIO_API_KEY_SECRET,
    {
      identity: `${orgId}:${agentId}`,
      ttl: 3600,
    }
  );

  const grant = new VoiceGrant({
    incomingAllow: true,
    outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
  });

  token.addGrant(grant);
  return token.toJwt();
}

async function initiateCall(params) {
  const {
    to,
    from,
    agentId,
    contactId,
    campaignId,
    orgId,
    recordingEnabled,
  } = params;

  const response = await getClient().calls.create({
    to,
    from,
    url: `${buildBaseUrl()}/api/dialer/webhooks/voice?agentId=${encodeURIComponent(agentId)}&contactId=${encodeURIComponent(contactId)}&orgId=${encodeURIComponent(orgId)}${campaignId ? `&campaignId=${encodeURIComponent(campaignId)}` : ''}`,
    statusCallback: `${buildBaseUrl()}/api/dialer/webhooks/status`,
    statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
    statusCallbackMethod: 'POST',
    record: recordingEnabled,
    recordingStatusCallback: `${buildBaseUrl()}/api/dialer/webhooks/recording`,
    recordingStatusCallbackEvent: ['in-progress', 'completed'],
  });

  return response.sid;
}

function generateTwiML({ agentCallSid, recordingEnabled }) {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();
  const dial = response.dial({
    timeout: 30,
    answerOnBridge: true,
    record: recordingEnabled ? 'record-from-answer-dual' : undefined,
    recordingStatusCallback: recordingEnabled ? `${buildBaseUrl()}/api/dialer/webhooks/recording` : undefined,
    recordingStatusCallbackEvent: recordingEnabled ? 'in-progress completed' : undefined,
    statusCallback: `${buildBaseUrl()}/api/dialer/webhooks/status`,
    statusCallbackEvent: 'initiated ringing answered completed',
  });
  if (dial && typeof dial.client === 'function') {
    dial.client(agentCallSid);
    return response.toString();
  }

  const recordingAttrs = recordingEnabled
    ? ` record="record-from-answer-dual" recordingStatusCallback="${buildBaseUrl()}/api/dialer/webhooks/recording" recordingStatusCallbackEvent="in-progress completed"`
    : '';

  return `<?xml version="1.0" encoding="UTF-8"?><Response><Dial timeout="30" answerOnBridge="true"${recordingAttrs} statusCallback="${buildBaseUrl()}/api/dialer/webhooks/status" statusCallbackEvent="initiated ringing answered completed"><Client>${agentCallSid}</Client></Dial></Response>`;
}

async function holdCall(callSid) {
  return getClient().calls(callSid).update({
    twiml: `<Response><Play>${process.env.TWILIO_HOLD_MUSIC_URL || 'https://api.twilio.com/cowbell.mp3'}</Play></Response>`,
  });
}

async function resumeCall(callSid) {
  return getClient().calls(callSid).update({
    twiml: `<Response><Pause length="1"/><Redirect method="POST">${buildBaseUrl()}/api/dialer/webhooks/voice</Redirect></Response>`,
  });
}

async function muteCall(callSid, muted) {
  return getClient().calls(callSid).update({
    muted: Boolean(muted),
  });
}

async function transferCall(callSid, to) {
  return getClient().calls(callSid).update({
    twiml: `<Response><Dial timeout="30"><Number>${to}</Number></Dial></Response>`,
  });
}

async function endCall(callSid) {
  return getClient().calls(callSid).update({ status: 'completed' });
}

async function getCallDetails(callSid) {
  const call = await getClient().calls(callSid).fetch();
  return {
    callSid: call.sid,
    duration: Number(call.duration || 0),
    status: call.status,
    direction: call.direction,
  };
}

module.exports = {
  generateAccessToken,
  initiateCall,
  generateTwiML,
  holdCall,
  resumeCall,
  muteCall,
  transferCall,
  endCall,
  getCallDetails,
  getClient,
};
