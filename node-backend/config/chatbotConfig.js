const DEFAULT_MODELS = Object.freeze({
  primary: 'gemini-3.1-flash-lite',
  fallback: ['gemini-2.5-flash-lite']
});

const DEFAULTS = Object.freeze({
  providerTimeoutMs: 30000,
  maxOutputTokens: 16384,
  maxFallbacks: 1,
  quotaMax: 360,
  quotaWindowMs: 15 * 60 * 1000,
  maxTextLength: 24000,
  historyCharBudget: 12000,
  historyMaxMessages: 12,
  models: DEFAULT_MODELS,
  features: {
    hybridRouting: true,
    fastPath: true,
    targetedCatalog: true,
    liveSearch: true
  }
});

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function booleanFlag(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function modelList(value, fallback) {
  if (!value) return [...fallback];
  const models = String(value).split(',').map(model => model.trim()).filter(Boolean);
  return models.length ? models : [...fallback];
}

function getChatbotConfig(env = process.env) {
  const primary = env.CHATBOT_PRIMARY_MODEL || env.CHATBOT_MODEL || DEFAULT_MODELS.primary;
  const configuredFallbacks = modelList(env.CHATBOT_FALLBACK_MODELS, DEFAULT_MODELS.fallback)
    .filter(model => model !== primary);

  return {
    models: {
      primary,
      fallback: configuredFallbacks,
      roles: {
        chat: env.CHATBOT_CHAT_MODEL || primary,
        stream: env.CHATBOT_STREAM_MODEL || primary,
        fast: 'deterministic'
      }
    },
    providerTimeoutMs: positiveInteger(env.CHATBOT_PROVIDER_TIMEOUT_MS, DEFAULTS.providerTimeoutMs),
    maxOutputTokens: positiveInteger(env.CHATBOT_MAX_OUTPUT_TOKENS, DEFAULTS.maxOutputTokens),
    maxFallbacks: Math.min(
      positiveInteger(env.CHATBOT_MAX_FALLBACKS, DEFAULTS.maxFallbacks),
      1
    ),
    quota: {
      limit: positiveInteger(env.CHATBOT_RATE_LIMIT_MAX, DEFAULTS.quotaMax),
      windowMs: positiveInteger(env.CHATBOT_RATE_LIMIT_WINDOW_MS, DEFAULTS.quotaWindowMs)
    },
    maxTextLength: positiveInteger(env.CHATBOT_MAX_TEXT_LENGTH, DEFAULTS.maxTextLength),
    history: {
      charBudget: positiveInteger(env.CHATBOT_HISTORY_CHAR_BUDGET, DEFAULTS.historyCharBudget),
      maxMessages: positiveInteger(env.CHATBOT_HISTORY_MAX_MESSAGES, DEFAULTS.historyMaxMessages)
    },
    features: {
      hybridRouting: booleanFlag(env.SPECAI_HYBRID_ROUTING_ENABLED, DEFAULTS.features.hybridRouting),
      fastPath: booleanFlag(env.SPECAI_FAST_PATH_ENABLED, DEFAULTS.features.fastPath),
      targetedCatalog: booleanFlag(env.SPECAI_TARGETED_CATALOG_ENABLED, DEFAULTS.features.targetedCatalog),
      liveSearch: booleanFlag(env.SPECAI_LIVE_SEARCH_ENABLED, DEFAULTS.features.liveSearch)
    }
  };
}

const chatbotConfig = getChatbotConfig();

module.exports = {
  DEFAULTS,
  chatbotConfig,
  getChatbotConfig
};
