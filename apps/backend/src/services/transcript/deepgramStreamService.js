const { createClient } = require('@deepgram/sdk');
const { saveSegment } = require('./segmentService');
const { detect } = require('../ai/objectionDetector');
const { analyzeSentiment } = require('../ai/sentimentAnalyzer');

class DeepgramStreamService {
  constructor(callId, socketIo) {
    this.connection = null;
    this.callId = callId;
    this.socketIo = socketIo;
    this.deepgramClient = null;
  }

  get client() {
    if (!this.deepgramClient) {
      this.deepgramClient = createClient(process.env.DEEPGRAM_API_KEY);
    }
    return this.deepgramClient;
  }

  getRoom() {
    return `call_${this.callId}`;
  }

  emit(event, payload) {
    this.socketIo?.to?.(this.getRoom())?.emit?.(event, payload);
  }

  async connect() {
    const live = this.client.listen.live({
      model: 'nova-2',
      language: 'en-US',
      smart_format: true,
      diarize: true,
      diarize_version: '3',
      utterance_end_ms: 1000,
      vad_events: true,
      interim_results: true,
      punctuate: true,
      filler_words: true,
      multichannel: true,
    });

    this.connection = live;
    live.on('transcript', (data) => this.handleTranscript(data));
    live.on('utterance_end', (data) => this.handleUtteranceEnd(data));
    live.on('error', (error) => this.handleError(error));

    return live;
  }

  async handleTranscript(data) {
    const channel = data?.channel?.alternatives?.[0] || data?.channel?.[0]?.alternatives?.[0] || null;
    const alternatives = channel ? [channel] : data?.channel?.alternatives || [];
    const text = alternatives[0]?.transcript || data?.channel?.alternatives?.[0]?.transcript || data?.transcript || '';
    const confidence = Number(alternatives[0]?.confidence || data?.confidence || 0);
    const isFinal = Boolean(data?.is_final || data?.speech_final);
    const speaker = Number(data?.channel_index) === 0 ? 'AGENT' : Number(data?.channel_index) === 1 ? 'CONTACT' : 'UNKNOWN';
    const sentiment = await analyzeSentiment(text);

    this.emit('transcript_update', {
      speaker,
      text,
      is_final: isFinal,
      confidence,
      sentiment,
    });

    if (isFinal && text) {
      await saveSegment(this.callId, {
        speaker,
        text,
        confidence,
        sentimentScore: sentiment,
        startMs: Number(data?.start || 0) * 1000,
        endMs: Number(data?.duration || 0) * 1000,
        isObjection: false,
      });
    }
  }

  async handleUtteranceEnd(data) {
    const lastUtterance = data?.transcript || data?.text || '';
    if (!lastUtterance) {
      this.emit('utterance_complete', { callId: this.callId });
      return;
    }

    const objection = await detect({
      lastUtterance,
      recentContext: data?.recentContext || [],
      callId: this.callId,
    });

    this.emit('utterance_complete', {
      callId: this.callId,
      objection,
    });
  }

  handleError(error) {
    this.emit('transcript_error', { callId: this.callId, error: error?.message || String(error) });
  }

  sendAudio(audioBuffer) {
    if (!this.connection || typeof this.connection.send !== 'function') {
      return false;
    }

    const writable = this.connection.send(audioBuffer);
    return writable !== false;
  }

  async disconnect() {
    if (this.connection && typeof this.connection.close === 'function') {
      this.connection.close();
    }
    this.connection = null;
  }

  async streamFromTwilio(callSid) {
    return {
      callSid,
      wsUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/api/dialer/webhooks/voice?callSid=${encodeURIComponent(callSid)}`,
    };
  }
}

module.exports = { DeepgramStreamService };
