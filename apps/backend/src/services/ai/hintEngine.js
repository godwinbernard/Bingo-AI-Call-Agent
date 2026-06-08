const { getPrisma } = require('../../data/prisma');
const { detect } = require('./objectionDetector');
const { analyzeSentiment } = require('./sentimentAnalyzer');

class HintEngine {
  constructor(callId, script, socketIo) {
    this.callId = callId;
    this.script = script;
    this.socketIo = socketIo;
    this.recentTranscript = [];
    this.lastHintTime = 0;
    this.MIN_HINT_INTERVAL = 8000;
  }

  emit(hint) {
    this.socketIo?.to?.(`call_${this.callId}`)?.emit?.('new_hint', hint);
  }

  async processUtterance(segment) {
    this.recentTranscript.push(segment.text);
    this.recentTranscript = this.recentTranscript.slice(-5);

    if (Date.now() - this.lastHintTime < this.MIN_HINT_INTERVAL) {
      return null;
    }

    const results = await Promise.all([
      this.checkForObjection(segment),
      this.checkSpeakingSpeed(segment),
      this.checkSentiment(segment),
      this.checkScriptAlignment(segment),
    ]);

    const hint = results.filter(Boolean).sort((a, b) => (b.priority || 0) - (a.priority || 0))[0] || null;
    if (!hint) return null;

    this.lastHintTime = Date.now();
    await this.generateHint(hint.type, hint.content, hint.objectionType);
    return hint;
  }

  async checkForObjection(segment) {
    const detection = await detect({
      lastUtterance: segment.text,
      recentContext: this.recentTranscript,
      callId: this.callId,
    });

    if (!detection.isObjection) return null;

    return {
      type: 'OBJECTION_RESPONSE',
      content: detection.suggestedResponse || 'Acknowledge the concern and ask a brief follow-up question.',
      objectionType: detection.type || null,
      priority: 100,
    };
  }

  checkSpeakingSpeed(segment) {
    const words = (segment.text || '').split(/\s+/).filter(Boolean).length;
    const durationMinutes = Math.max((Number(segment.endMs || segment.end_ms || 0) - Number(segment.startMs || segment.start_ms || 0)) / 60000, 1 / 60);
    const wpm = Math.round(words / durationMinutes);

    if (wpm > 180) {
      return {
        type: 'SPEED_WARNING',
        content: 'Slow down slightly. Shorter pauses will help the contact absorb the message.',
        priority: 80,
      };
    }

    if (wpm < 100) {
      return {
        type: 'SPEED_WARNING',
        content: 'Pick up the pace a bit to keep momentum.',
        priority: 70,
      };
    }

    return null;
  }

  async checkSentiment(segment) {
    const sentiment = typeof segment.sentiment_score === 'number' ? segment.sentiment_score : await analyzeSentiment(segment.text);
    if (sentiment < 0.3) {
      return {
        type: 'SENTIMENT_ALERT',
        content: 'Tone is dropping. Reframe with empathy and a question.',
        priority: 60,
      };
    }
    return null;
  }

  async checkScriptAlignment(segment) {
    const transcript = this.recentTranscript.join(' ').toLowerCase();
    const scriptSummary = JSON.stringify(this.script || {}).toLowerCase();
    if (this.script && scriptSummary && transcript && !transcript.includes(scriptSummary.slice(0, 20))) {
      return {
        type: 'SCRIPT_REMINDER',
        content: 'Bring the conversation back to the script’s next step.',
        priority: 40,
      };
    }
    return null;
  }

  async generateHint(type, content, objectionType) {
    const hint = await getPrisma().aiHint.create({
      data: {
        call_id: this.callId,
        triggered_at_ms: Date.now(),
        hint_type: type,
        content,
        objection_type: objectionType || null,
        was_used: false,
        dismissed: false,
      },
    });

    this.emit({
      id: hint.id,
      hintType: hint.hint_type,
      content: hint.content,
      priority: 1,
    });

    return hint;
  }
}

module.exports = { HintEngine };
