const { createClient } = require('@deepgram/sdk');

let deepgramClient = null;
const MIN_CONFIDENCE = 0.6;
const SILENCE_TIMEOUT_MS = 5000;

function getClient() {
  if (!deepgramClient) {
    deepgramClient = createClient(process.env.DEEPGRAM_API_KEY);
  }
  return deepgramClient;
}

// Transcribe a recorded audio URL (for Twilio RecordingUrl)
async function transcribeUrl(audioUrl, options = {}) {
  const dg = getClient();

  try {
    const transcriptionPromise = dg.listen.prerecorded.transcribeUrl(
      { url: audioUrl },
      {
        model: 'nova-2',
        smart_format: true,
        punctuate: true,
        language: options.language || 'en-US',
        ...options,
      }
    );

    const { result, error } = await withTimeout(transcriptionPromise, options.timeoutMs || SILENCE_TIMEOUT_MS);

    if (error) throw new Error(error.message);

    const transcript = result?.results?.channels?.[0]?.alternatives?.[0];
    if (!transcript) return { text: '', confidence: 0 };

    const response = {
      text: transcript.transcript || '',
      confidence: transcript.confidence || 0,
      words: transcript.words || [],
    };

    if (!isConfidentTranscription(response)) {
      response.shouldRepeat = true;
    }

    return response;
  } catch (err) {
    console.error('[Deepgram] Transcription error:', err.message);
    return { text: '', confidence: 0, error: err.message };
  }
}

// Process Twilio SpeechResult (already transcribed by Twilio's Gather)
// This is used as primary STT when Deepgram streaming isn't set up
function processTwilioSpeechResult(speechResult, confidence) {
  return {
    text: speechResult || '',
    confidence: parseFloat(confidence || '0'),
    source: 'twilio',
  };
}

// Minimum confidence threshold for accepting a transcription
function isConfidentTranscription(result) {
  return result.text.length > 0 && result.confidence >= MIN_CONFIDENCE;
}

function shouldRepeatPrompt(result) {
  return !isConfidentTranscription(result);
}

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Silence timeout after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
}

module.exports = {
  transcribeUrl,
  processTwilioSpeechResult,
  isConfidentTranscription,
  shouldRepeatPrompt,
  withTimeout,
  MIN_CONFIDENCE,
  SILENCE_TIMEOUT_MS,
};
