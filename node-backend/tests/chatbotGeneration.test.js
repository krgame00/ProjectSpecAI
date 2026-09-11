const {
  createGenerationConfig,
  generateContentWithFallback,
  consumeStreamWithFallback,
  modelCandidates,
} = require('../services/chatbotGeneration');

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

  test('reserves 16,384 output tokens for streaming and disables thinking on the fast stream path', async () => {
    const generateContentStream = jest.fn().mockResolvedValue({
      async *[Symbol.asyncIterator]() {
        yield { text: 'ok' };
      },
    });

    await consumeStreamWithFallback({
      ai: { models: { generateContentStream } },
      contents: [{ role: 'user', parts: [{ text: 'จัดสเปคคอมให้หน่อย' }] }],
      config: {
        models: { primary: 'a', fallback: [] },
        maxFallbacks: 0,
        providerTimeoutMs: 1000,
        maxOutputTokens: 16384,
      },
      onChunk: jest.fn(),
    });

    expect(generateContentStream).toHaveBeenCalledWith(expect.objectContaining({
      config: expect.objectContaining({
        maxOutputTokens: 16384,
        thinkingConfig: { thinkingBudget: 0 },
      }),
    }));
  });
});
