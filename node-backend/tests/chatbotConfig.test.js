const { getChatbotConfig } = require('../config/chatbotConfig');

describe('chatbot operational config', () => {
  test('uses production defaults from the implementation contract', () => {
    const config = getChatbotConfig({});
    expect(config.models.primary).toBe('gemini-3.1-flash-lite');
    expect(config.maxOutputTokens).toBe(16384);
    expect(config.maxFallbacks).toBe(1);
    expect(config.quota).toEqual({ limit: 360, windowMs: 900000 });
    expect(config.maxTextLength).toBe(24000);
    expect(config.history).toEqual({ charBudget: 12000, maxMessages: 12 });
  });

  test('allows safe environment overrides and caps fallback count at one', () => {
    const config = getChatbotConfig({
      CHATBOT_PRIMARY_MODEL: 'primary-test',
      CHATBOT_FALLBACK_MODELS: 'backup-a,backup-b',
      CHATBOT_MAX_FALLBACKS: '20',
      CHATBOT_MAX_OUTPUT_TOKENS: '8192',
      CHATBOT_RATE_LIMIT_MAX: '10',
      SPECAI_FAST_PATH_ENABLED: 'false',
    });
    expect(config.models.primary).toBe('primary-test');
    expect(config.models.fallback).toEqual(['backup-a', 'backup-b']);
    expect(config.maxOutputTokens).toBe(8192);
    expect(config.maxFallbacks).toBe(1);
    expect(config.quota.limit).toBe(10);
    expect(config.features.fastPath).toBe(false);
  });
});
