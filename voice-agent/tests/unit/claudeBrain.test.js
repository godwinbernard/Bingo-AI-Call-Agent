describe('claudeBrain', () => {
  function loadBrain(mockCreate) {
    jest.doMock('@anthropic-ai/sdk', () =>
      jest.fn().mockImplementation(() => ({
        messages: {
          create: mockCreate,
        },
      }))
    );

    return require('../../src/conversation/claudeBrain');
  }

  beforeEach(() => {
    jest.resetModules();
  });

  test('returns a response string (not null)', async () => {
    const mockCreate = jest.fn().mockResolvedValue({
      content: [{ text: JSON.stringify({ text: 'I hear you. Would you like a quick example?', intent: 'continue' }) }],
    });
    const { generateResponse } = loadBrain(mockCreate);

    const response = await generateResponse(
      { messages: [], systemPrompt: 'prompt', agentName: 'Alex', turnCount: 0 },
      'Tell me more'
    );

    expect(response.text).toBeTruthy();
    expect(typeof response.text).toBe('string');
  });

  test('keeps response under 2 sentences', async () => {
    const mockCreate = jest.fn().mockResolvedValue({
      content: [
        {
          text: JSON.stringify({
            text: 'Sentence one. Sentence two. Sentence three.',
            intent: 'continue',
          }),
        },
      ],
    });
    const { generateResponse } = loadBrain(mockCreate);

    const response = await generateResponse(
      { messages: [], systemPrompt: 'prompt', agentName: 'Alex', turnCount: 0 },
      'Tell me more'
    );

    expect(response.text.split(/[.!?]/).filter(Boolean).length).toBeLessThanOrEqual(2);
  });

  test('detects goal_achieved correctly', async () => {
    const mockCreate = jest.fn().mockResolvedValue({
      content: [
        {
          text: JSON.stringify({ text: 'Perfect!', goal_achieved: true, intent: 'end_call' }),
        },
      ],
    });
    const brain = loadBrain(mockCreate);

    expect(brain.detectGoalAchieved('goal_achieved: true')).toBe(true);
    const response = await brain.generateResponse(
      { messages: [], systemPrompt: 'prompt', agentName: 'Alex', turnCount: 0 },
      'Sounds good'
    );
    expect(response.goal_achieved).toBe(true);
  });

  test('detects end_call intent correctly', async () => {
    const mockCreate = jest.fn().mockResolvedValue({
      content: [
        {
          text: JSON.stringify({ text: 'Absolutely no problem at all. Have a wonderful day!', intent: 'end_call' }),
        },
      ],
    });
    const { generateResponse, detectEndCallIntent } = loadBrain(mockCreate);

    expect(detectEndCallIntent('Please end_call now')).toBe(true);
    const response = await generateResponse(
      { messages: [], systemPrompt: 'prompt', agentName: 'Alex', turnCount: 0 },
      'Sounds good'
    );
    expect(response.shouldEnd).toBe(true);
  });

  test('builds correct conversation history format', () => {
    const brain = loadBrain(jest.fn());
    expect(brain.buildConversationHistory([{ role: 'assistant', content: 'Hi' }], 'Hello')).toEqual([
      { role: 'assistant', content: 'Hi' },
      { role: 'user', content: 'Hello' },
    ]);
  });

  test('stops at max 15 turns', async () => {
    const mockCreate = jest.fn();
    const { generateResponse } = loadBrain(mockCreate);

    const response = await generateResponse(
      { messages: [], systemPrompt: 'prompt', agentName: 'Alex', turnCount: 15 },
      'Hello'
    );

    expect(mockCreate).not.toHaveBeenCalled();
    expect(response.shouldEnd).toBe(true);
  });

  test('handles Claude API timeout gracefully', async () => {
    const mockCreate = jest.fn().mockRejectedValue(new Error('timeout'));
    const { generateResponse } = loadBrain(mockCreate);

    const response = await generateResponse(
      { messages: [], systemPrompt: 'prompt', agentName: 'Alex', turnCount: 0 },
      'Hello'
    );

    expect(response.error).toBe('timeout');
    expect(response.text).toContain('trouble right now');
  });

  test('falls back to script on API error', async () => {
    const mockCreate = jest.fn().mockRejectedValue(new Error('boom'));
    const { generateResponse } = loadBrain(mockCreate);

    const response = await generateResponse(
      {
        messages: [],
        systemPrompt: 'prompt',
        agentName: 'Alex',
        turnCount: 0,
        script: { failure_close: 'Thanks for your time. Goodbye.' },
      },
      'Hello'
    );

    expect(response.text).toBe('Thanks for your time. Goodbye.');
  });

  test('never claims to be human in response', async () => {
    const mockCreate = jest.fn().mockResolvedValue({
      content: [
        {
          text: JSON.stringify({ text: "I am a human. Let's talk.", intent: 'continue' }),
        },
      ],
    });
    const { generateResponse } = loadBrain(mockCreate);

    const response = await generateResponse(
      { messages: [], systemPrompt: 'prompt', agentName: 'Alex', turnCount: 0 },
      'Hello'
    );

    expect(response.text.toLowerCase()).not.toContain('human');
    expect(response.text).toContain('AI voice agent');
  });
});
