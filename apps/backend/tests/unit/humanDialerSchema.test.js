const fs = require('fs');
const path = require('path');

describe('human dialer prisma schema', () => {
  it('declares the human dialer models and enums', () => {
    const schemaPath = path.join(__dirname, '../../prisma/schema.prisma');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    const requiredSnippets = [
      'model HumanCall {',
      'model CallTranscript {',
      'model TranscriptSegment {',
      'model CallScorecard {',
      'model AiHint {',
      'model AgentPerformance {',
      'model DialerSession {',
      'enum CallDirection {',
      'enum HumanCallStatus {',
      'enum HumanCallOutcome {',
      'enum Speaker {',
      'enum HintType {',
      'enum SessionStatus {',
    ];

    for (const snippet of requiredSnippets) {
      expect(schema).toContain(snippet);
    }
  });
});
