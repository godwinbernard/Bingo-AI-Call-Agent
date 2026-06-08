/**
 * TCPA COMPLIANCE NOTICE
 * ----------------------
 * This dialer is intended for use only with prior express written consent.
 * Do NOT use this system to call numbers on the National DNC Registry
 * without a valid established business relationship or express invitation.
 * Calling hours must comply with TCPA: 8am–9pm local time of the called party.
 * All AI-generated calls must disclose the artificial nature of the call
 * at the beginning of the message or upon direct inquiry.
 * Consult legal counsel before deploying this system commercially.
 */

const twilio = require('twilio');
const { checkCompliance, addToDNC } = require('../compliance/dncChecker');
const { logCallStart, updateCallStatus } = require('../data/callLogger');
const { setCallSession } = require('../state/redisManager');
const { buildSystemPrompt, buildOpeningMessage, buildVoicemailScript } = require('../conversation/scriptEngine');

let twilioClient = null;

function getClient() {
  if (!twilioClient) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
}

async function initiateCall(contact, campaignConfig) {
  const { script, campaignId } = campaignConfig;
  const baseUrl = process.env.BASE_URL;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  // Compliance check
  const compliance = checkCompliance(contact.phone, contact.timezone);
  if (!compliance.allowed) {
    console.log(`[Dialer] Skipping ${contact.phone}: ${compliance.reason}`);
    await logCallStart({ callSid: `skipped_${Date.now()}`, campaignId, phoneNumber: contact.phone, contactName: contact.first_name });
    return null;
  }

  const systemPrompt = buildSystemPrompt(script, contact);
  const openingMessage = buildOpeningMessage(script, contact);
  const voicemailText = buildVoicemailScript(script, contact);

  let call;
  try {
    call = await getClient().calls.create({
      to: contact.phone,
      from: fromNumber,
      url: `${baseUrl}/webhook/answer?campaignId=${campaignId}`,
      statusCallback: `${baseUrl}/webhook/status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      statusCallbackMethod: 'POST',
      machineDetection: 'DetectMessageEnd',
      asyncAmd: 'true',
      asyncAmdStatusCallback: `${baseUrl}/webhook/amd`,
      timeout: 30,
    });
  } catch (err) {
    console.error(`[Dialer] Twilio call creation failed for ${contact.phone}:`, err.message);
    throw err;
  }

  // Persist session state in Redis
  await setCallSession(call.sid, {
    callSid: call.sid,
    campaignId,
    contact,
    systemPrompt,
    openingMessage,
    voicemailText,
    agentName: script.agent_name || 'Alex',
    messages: [],
    turnCount: 0,
    startedAt: new Date().toISOString(),
  });

  // Log to PostgreSQL
  await logCallStart({
    callSid: call.sid,
    campaignId,
    phoneNumber: contact.phone,
    contactName: `${contact.first_name || ''} ${contact.last_name || ''}`.trim(),
  });

  console.log(`[Dialer] Call initiated: ${call.sid} → ${contact.phone}`);
  return call.sid;
}

module.exports = { dialerService: { initiateCall }, getClient };
