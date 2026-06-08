// AMD (Answering Machine Detection) result handler
// Twilio sends AnsweredBy values: human, machine_start, machine_end_beep,
// machine_end_silence, machine_end_other, fax, unknown

const MACHINE_STATUSES = new Set([
  'machine_start',
  'machine_end_beep',
  'machine_end_silence',
  'machine_end_other',
]);

function isVoicemail(answeredBy) {
  return MACHINE_STATUSES.has(answeredBy);
}

function isHuman(answeredBy) {
  return answeredBy === 'human';
}

function isFax(answeredBy) {
  return answeredBy === 'fax';
}

// Returns 'human', 'voicemail', 'fax', or 'unknown'
function classifyAnswer(answeredBy) {
  if (isHuman(answeredBy)) return 'human';
  if (isVoicemail(answeredBy)) return 'voicemail';
  if (isFax(answeredBy)) return 'fax';
  return 'unknown';
}

// Build TwiML to leave a voicemail message
function buildVoicemailTwiML(voicemailText, voice = 'Polly.Joanna-Neural') {
  const escaped = voicemailText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Pause length="2"/>
  <Say voice="${voice}">${escaped}</Say>
  <Pause length="1"/>
  <Hangup/>
</Response>`;
}

module.exports = { isVoicemail, isHuman, classifyAnswer, buildVoicemailTwiML };
