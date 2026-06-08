const path = require('path');
const { loadScript, injectVariables, getObjectionResponse, buildVoicemailScript } = require('../../src/conversation/scriptEngine');

describe('scriptEngine', () => {
  const fixture = path.join(__dirname, '../fixtures/test_script.json');

  test('loads script JSON correctly', () => {
    expect(loadScript(fixture)).toMatchObject({
      agent_name: 'Alex',
      campaign_name: 'Test Outreach Campaign',
    });
  });

  test('replaces {name} variable in opening', () => {
    const script = loadScript(fixture);
    expect(injectVariables(script.opening, { name: 'Taylor' }, script.variables)).toContain('Taylor');
  });

  test('replaces {context} variable in opening', () => {
    const script = loadScript(fixture);
    const text = injectVariables(script.introduction, { context: 'a free trial' }, script.variables);
    expect(text).toContain('a free trial');
  });

  test('returns correct objection response for too busy', () => {
    const script = loadScript(fixture);
    expect(getObjectionResponse(script, 'too busy')).toContain('call back later today');
  });

  test('returns correct objection response for not interested', () => {
    const script = loadScript(fixture);
    expect(getObjectionResponse(script, 'not interested')).toContain('close this out politely');
  });

  test('returns correct objection response for too expensive', () => {
    const script = loadScript(fixture);
    expect(getObjectionResponse(script, 'too expensive')).toContain("keep it brief");
  });

  test('returns null for unknown objection', () => {
    const script = loadScript(fixture);
    expect(getObjectionResponse(script, 'unknown')).toBeNull();
  });

  test('returns voicemail message with variables', () => {
    const script = loadScript(fixture);
    const message = buildVoicemailScript(script, { name: 'Jordan' });
    expect(message).toContain('Jordan');
    expect(message).toContain('Acme AI');
  });

  test('throws error if script file not found', () => {
    expect(() => loadScript(path.join(__dirname, '../fixtures/missing-script.json'))).toThrow('Script file not found');
  });
});
