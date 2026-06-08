const { buildHumanDialerSeedData } = require('../../src/dialer/humanDialerSeedData');

describe('human dialer seed data', () => {
  it('builds one agent with ten completed calls and scorecards', () => {
    const seed = buildHumanDialerSeedData();

    expect(seed.agents).toHaveLength(1);
    expect(seed.calls).toHaveLength(10);
    expect(seed.transcripts).toHaveLength(10);
    expect(seed.scorecards).toHaveLength(10);
    expect(seed.calls.every((call) => call.status === 'COMPLETED')).toBe(true);
    expect(seed.scorecards.every((scorecard) => typeof scorecard.overall_score === 'number')).toBe(true);
  });
});
