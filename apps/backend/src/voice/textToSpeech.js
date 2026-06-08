const axios = require('axios');

const ELEVENLABS_BASE = 'https://api.elevenlabs.io/v1';

async function synthesizeWithElevenLabs(text, voiceId) {
  if (!text || !text.trim()) {
    return Buffer.alloc(0);
  }

  const vid = voiceId || process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

  const response = await axios.post(
    `${ELEVENLABS_BASE}/text-to-speech/${vid}`,
    {
      text,
      model_id: 'eleven_turbo_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    },
    {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      responseType: 'arraybuffer',
      timeout: 8000,
    }
  );

  return Buffer.from(response.data);
}

// Returns TwiML <Play> or <Say> element string for Twilio
async function getTwilioTTSElement(text, voiceId) {
  if (!text || !text.trim()) {
    return buildPollyElement('');
  }

  // Attempt ElevenLabs first, fall back to Twilio Polly
  if (process.env.ELEVENLABS_API_KEY) {
    try {
      const audioBuffer = await synthesizeWithElevenLabs(text, voiceId);
      // In production: upload audioBuffer to S3/GCS and return <Play> URL
      // For now, return Polly fallback so the call flow works without storage
      console.log('[TTS] ElevenLabs audio generated (storage integration needed for <Play>)');
    } catch (err) {
      console.warn('[TTS] ElevenLabs failed, falling back to Polly:', err.message);
    }
  }

  // Twilio Polly fallback — works out of the box
  return buildPollyElement(text);
}

function buildPollyElement(text, voice = 'Polly.Joanna-Neural') {
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<Say voice="${voice}">${escaped}</Say>`;
}

function buildGatherWithSay(text, actionUrl, options = {}) {
  const voice = options.voice || 'Polly.Joanna-Neural';
  const timeout = options.timeout || 5;
  const speechTimeout = options.speechTimeout || 'auto';
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="${actionUrl}" timeout="${timeout}" speechTimeout="${speechTimeout}" language="en-US">
    <Say voice="${voice}">${escaped}</Say>
  </Gather>
  <Redirect>${actionUrl}?timeout=true</Redirect>
</Response>`;
}

module.exports = { synthesizeWithElevenLabs, getTwilioTTSElement, buildPollyElement, buildGatherWithSay };
