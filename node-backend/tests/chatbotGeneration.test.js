const {
  createGenerationConfig,
  generateContentWithFallback,
  consumeStreamWithFallback,
  modelCandidates,
} = require('../services/chatbotGeneration');
const { createGeminiAiPool } = require('../services/chatbotAiPool');

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

  test('restarts the same streamed model on the next API key when quota is exhausted mid-stream', async () => {
    const GoogleGenAI = jest.fn(({ apiKey }) => ({
      models: {
        generateContentStream: jest.fn().mockResolvedValue({
          async *[Symbol.asyncIterator]() {
            if (apiKey === 'key-1') {
              yield { text: 'partial' };
              throw Object.assign(new Error('RESOURCE_EXHAUSTED quota exceeded'), { status: 429 });
            }
            yield { text: 'final' };
          },
        }),
      },
    }));
    const ai = createGeminiAiPool({
      GoogleGenAI,
      env: { GEMINI_API_KEYS: 'key-1,key-2' },
      logger: { warn: jest.fn() },
    });
    const visibleChunks = [];
    const onRetry = jest.fn(() => {
      visibleChunks.length = 0;
    });

    const result = await consumeStreamWithFallback({
      ai,
      contents: [{ role: 'user', parts: [{ text: 'จัดสเปคคอมให้หน่อย' }] }],
      config: {
        models: { primary: 'a', fallback: [] },
        maxFallbacks: 0,
        providerTimeoutMs: 1000,
        maxOutputTokens: 16384,
      },
      onChunk: (chunk) => visibleChunks.push(chunk.text),
      onRetry,
    });

    expect(visibleChunks).toEqual(['final']);
    expect(onRetry).toHaveBeenCalledWith(expect.objectContaining({
      apiKeySwitch: true,
      fromProviderIndex: 0,
      toProviderIndex: 1,
    }));
    expect(result.providerIndex).toBe(1);
    expect(result.providerCount).toBe(2);
  });
});
