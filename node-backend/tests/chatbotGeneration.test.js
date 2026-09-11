const { createGenerationConfig, generateContentWithFallback, modelCandidates } = require('../services/chatbotGeneration');

describe('chatbot generation policy', () => {
  test('uses one fallback for retryable provider errors', async () => {
    const generateContent = jest.fn()
      .mockRejectedValueOnce(Object.assign(new Error('503 unavailable'), { status: 503 }))
      .mockResolvedValueOnce({ text: 'ok' });
    const result = await generateContentWithFallback({
      ai: { models: { generateContent } },
      contents: [{ role: 'user', parts: [{ text: 'hello' }] }],
      config: { models: { primary: 'a', fallback: ['b', 'c'] }, maxFallbacks: 1, providerTimeoutMs: 1000 },
    });
    expect(generateContent).toHaveBeenCalledTimes(2);
    expect(result.model).toBe('b');
  });

  test('does not fallback for arbitrary provider errors and only adds search tools when requested', () => {
    expect(modelCandidates({ models: { primary: 'a', fallback: ['b', 'c'] }, maxFallbacks: 99 })).toEqual(['a', 'b']);
    expect(createGenerationConfig({ systemInstruction: 'x', useLiveSearch: false })).not.toHaveProperty('tools');
    expect(createGenerationConfig({ systemInstruction: 'x', useLiveSearch: true })).toEqual(expect.objectContaining({ tools: [{ googleSearch: {} }] }));
  });
});
