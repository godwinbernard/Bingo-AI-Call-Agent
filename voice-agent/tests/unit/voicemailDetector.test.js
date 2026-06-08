const { classifyAnswer, buildVoicemailTwiML } = require('../../src/caller/voicemailDetector');

describe('voicemailDetector', () => {
  test('returns human for human AMD result', () => {
    expect(classifyAnswer('human')).toBe('human');
  });

  test('returns voicemail for machine AMD result', () => {
    expect(classifyAnswer('machine_start')).toBe('voicemail');
  });

  test('returns unknown for ambiguous result', () => {
    expect(classifyAnswer('unknown')).toBe('unknown');
  });

  test('triggers voicemail message correctly', () => {
    const twiml = buildVoicemailTwiML('Please call back soon.');
    expect(twiml).toContain('<Say');
    expect(twiml).toContain('Please call back soon.');
  });

  test('hangs up after voicemail message plays', () => {
    const twiml = buildVoicemailTwiML('Hello there');
    expect(twiml).toContain('<Hangup/>');
  });
});
