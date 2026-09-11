const {
  parseGeminiApiKeys,
  isQuotaExhaustionError,
  createGeminiAiPool,
} = require('../services/chatbotAiPool');

describe('Gemini API key pool', () => {
  test('collects unique keys from aggregate, numbered and legacy envs and caps the pool at five', () => {
    const keys = parseGeminiApiKeys({
      GEMINI_API_KEYS: 'key-a,key-b\nkey-c',
      GEMINI_API_KEY_1: 'key-b',
      GEMINI_API_KEY_2: 'key-d',
      GEMINI_API_KEY_3: 'key-e',
      GEMINI_API_KEY_4: 'key-f',
      GEMINI_API_KEY: 'legacy-key',
    });

    expect(keys).toEqual(['key-a', 'key-b', 'key-c', 'key-d', 'key-e']);
  });

  test.each([
    [Object.assign(new Error('429 Too Many Requests'), { status: 429 }), true],
    [new Error('RESOURCE_EXHAUSTED: quota exceeded'), true],
    [new Error('rate limit exceeded'), true],
    [Object.assign(new Error('503 unavailable'), { status: 503 }), false],
    [new Error('invalid API key'), false],
  ])('classifies quota-only failover errors', (error, expected) => {
    expect(isQuotaExhaustionError(error)).toBe(expected);
  });

  test('switches to the next API key on quota exhaustion and keeps the successful key active', async () => {
    const clients = [];
    const GoogleGenAI = jest.fn(({ apiKey }) => {
      const client = { apiKey, models: {} };
      clients.push(client);
      return client;
    });
    const switches = [];
    const pool = createGeminiAiPool({
      GoogleGenAI,
      env: { GEMINI_API_KEYS: 'key-1,key-2,key-3' },
      logger: { warn: jest.fn() },
    });
    const calls = [];

    const first = await pool.runWithQuotaFailover(async (client) => {
      calls.push(client.apiKey);
      if (client.apiKey === 'key-1') {
        throw Object.assign(new Error('quota exceeded'), { status: 429 });
      }
      return `ok:${client.apiKey}`;
    }, {
      onSwitch: (event) => switches.push(event),
    });

    expect(first.result).toBe('ok:key-2');
    expect(first.providerIndex).toBe(1);
    expect(calls).toEqual(['key-1', 'key-2']);
    expect(switches).toEqual([
      expect.objectContaining({ fromIndex: 0, toIndex: 1, providerCount: 3 }),
    ]);

    calls.length = 0;
    const second = await pool.runWithQuotaFailover(async (client) => {
      calls.push(client.apiKey);
      return `ok:${client.apiKey}`;
    });

    expect(second.result).toBe('ok:key-2');
    expect(calls).toEqual(['key-2']);
  });

  test('does not rotate keys for non-quota provider failures', async () => {
    const GoogleGenAI = jest.fn(({ apiKey }) => ({ apiKey, models: {} }));
    const pool = createGeminiAiPool({
      GoogleGenAI,
      env: { GEMINI_API_KEYS: 'key-1,key-2' },
      logger: { warn: jest.fn() },
    });
    const calls = [];

    await expect(pool.runWithQuotaFailover(async (client) => {
      calls.push(client.apiKey);
      throw Object.assign(new Error('503 unavailable'), { status: 503 });
    })).rejects.toThrow('503 unavailable');

    expect(calls).toEqual(['key-1']);
  });

  test('uses an explicitly configured key pool over Vertex while preserving legacy Vertex precedence', () => {
    const GoogleGenAI = jest.fn((options) => ({ options, models: {} }));

    const keyPool = createGeminiAiPool({
      GoogleGenAI,
      env: { GCP_PROJECT: 'vertex-project', GEMINI_API_KEYS: 'key-1,key-2' },
      logger: { warn: jest.fn() },
    });
    expect(keyPool.mode).toBe('api-key-pool');
    expect(keyPool.providerCount).toBe(2);

    const legacyVertexPool = createGeminiAiPool({
      GoogleGenAI,
      env: { GCP_PROJECT: 'vertex-project', GEMINI_API_KEY: 'legacy-key' },
      logger: { warn: jest.fn() },
    });
    expect(legacyVertexPool.mode).toBe('vertex');
    expect(legacyVertexPool.providerCount).toBe(1);

    const legacyKeyPool = createGeminiAiPool({
      GoogleGenAI,
      env: { GEMINI_API_KEY: 'legacy-key' },
      logger: { warn: jest.fn() },
    });
    expect(legacyKeyPool.mode).toBe('api-key-pool');
    expect(legacyKeyPool.providerCount).toBe(1);
  });
});
