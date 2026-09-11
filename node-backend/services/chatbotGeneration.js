const { getChatbotConfig } = require('../config/chatbotConfig');

function providerErrorStatus(error) {
  return Number(error?.status || error?.statusCode || error?.code);
}

function isRetryableProviderError(error) {
  const status = providerErrorStatus(error);
  if ([404, 408, 429, 500, 502, 503, 504].includes(status)) return true;
  const message = String(error?.message || error || '').toLowerCase();
  return /(?:timeout|timed out|rate.?limit|resource_exhausted|unavailable|overloaded|temporar|model\s+not\s+found|not found|\b404\b|\b5\d\d\b)/i.test(message);
}

function withTimeout(promise, timeoutMs) {
  if (!timeoutMs || timeoutMs <= 0) return promise;
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const error = new Error('Chatbot provider request timed out');
      error.code = 'PROVIDER_TIMEOUT';
      reject(error);
    }, timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function modelCandidates(config = getChatbotConfig(), role = 'chat') {
  const primary = config.models?.roles?.[role] || config.models?.primary || 'gemini-3.1-flash-lite';
  const fallbacks = Array.isArray(config.models?.fallback) ? config.models.fallback : [];
  const maxFallbacks = Math.min(Number(config.maxFallbacks ?? 1), 1);
  return [primary, ...fallbacks.filter(model => model && model !== primary).slice(0, maxFallbacks)];
}

function createGenerationConfig({
  systemInstruction,
  useLiveSearch = false,
  temperature = 0.7,
  maxOutputTokens,
  thinkingBudget,
} = {}) {
  const config = { systemInstruction, temperature };
  if (Number.isInteger(maxOutputTokens) && maxOutputTokens > 0) {
    config.maxOutputTokens = maxOutputTokens;
  }
  if (Number.isInteger(thinkingBudget) && thinkingBudget >= 0) {
    config.thinkingConfig = { thinkingBudget };
  }
  if (useLiveSearch) config.tools = [{ googleSearch: {} }];
  return config;
}

async function executeWithProvider(ai, operation, onKeySwitch) {
  if (ai && typeof ai.runWithQuotaFailover === 'function') {
    return ai.runWithQuotaFailover(operation, { onSwitch: onKeySwitch });
  }

  return {
    result: await operation(ai),
    providerIndex: 0,
    providerCount: 1,
    mode: 'single',
  };
}

async function runWithFallback({ config, role, invoke, onRetry }) {
  let lastError;
  const models = modelCandidates(config, role);
  for (let index = 0; index < models.length; index += 1) {
    const model = models[index];
    try {
      const result = await invoke(model, index);
      return { result, model, fallbackCount: index };
    } catch (error) {
      lastError = error;
      if (index >= models.length - 1 || !isRetryableProviderError(error)) throw error;
      if (onRetry) await onRetry({ error, model, nextModel: models[index + 1], fallbackCount: index + 1 });
    }
  }
  throw lastError || new Error('Chatbot provider unavailable');
}

async function generateContentWithFallback({
  ai,
  contents,
  config = getChatbotConfig(),
  role = 'chat',
  systemInstruction,
  useLiveSearch = false,
  temperature = 0.7,
  onRetry,
}) {
  const result = await runWithFallback({
    config,
    role,
    onRetry,
    invoke: async (model) => executeWithProvider(
      ai,
      (client) => withTimeout(client.models.generateContent({
        model,
        contents,
        config: createGenerationConfig({
          systemInstruction,
          useLiveSearch,
          temperature,
          maxOutputTokens: config.maxOutputTokens,
        }),
      }), config.providerTimeoutMs),
    ),
  });
  return {
    response: result.result.result,
    model: result.model,
    fallbackCount: result.fallbackCount,
    providerIndex: result.result.providerIndex,
    providerCount: result.result.providerCount,
  };
}

async function consumeStreamWithFallback({
  ai,
  contents,
  config = getChatbotConfig(),
  role = 'stream',
  systemInstruction,
  useLiveSearch = false,
  temperature = 0.7,
  onChunk,
  onRetry,
}) {
  const result = await runWithFallback({
    config,
    role,
    onRetry,
    invoke: async (model, index) => executeWithProvider(
      ai,
      async (client) => {
        const stream = await withTimeout(client.models.generateContentStream({
          model,
          contents,
          config: createGenerationConfig({
            systemInstruction,
            useLiveSearch,
            temperature,
            maxOutputTokens: config.maxOutputTokens,
            thinkingBudget: 0,
          }),
        }), config.providerTimeoutMs);
        const iterator = stream[Symbol.asyncIterator]();
        while (true) {
          const next = await withTimeout(iterator.next(), config.providerTimeoutMs);
          if (next.done) break;
          if (onChunk) await onChunk(next.value, { model, fallbackCount: index });
        }
        return true;
      },
      async ({ error, fromIndex, toIndex, providerCount }) => {
        if (onRetry) {
          await onRetry({
            error,
            model,
            nextModel: model,
            fallbackCount: index,
            apiKeySwitch: true,
            fromProviderIndex: fromIndex,
            toProviderIndex: toIndex,
            providerCount,
          });
        }
      },
    ),
  });
  return {
    model: result.model,
    fallbackCount: result.fallbackCount,
    providerIndex: result.result.providerIndex,
    providerCount: result.result.providerCount,
  };
}

function responseText(response) {
  let text = response?.text;
  if (typeof text === 'function') text = text();
  return typeof text === 'string' ? text : '';
}

function parseModelResponse(text) {
  const raw = String(text || '');
  const markerIndex = raw.indexOf('---JSON_START---');
  const conversational = markerIndex >= 0 ? raw.slice(0, markerIndex).trim() : raw.trim();
  const jsonPart = markerIndex >= 0 ? raw.slice(markerIndex + '---JSON_START---'.length).trim() : '';
  const cleaned = (jsonPart || conversational).replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (markerIndex < 0 && parsed && typeof parsed === 'object' && (Object.prototype.hasOwnProperty.call(parsed, 'reply') || Object.prototype.hasOwnProperty.call(parsed, 'recommended_build'))) {
      return {
        reply: typeof parsed.reply === 'string' ? parsed.reply : '',
        recommended_build: parsed.recommended_build || null,
        parsed,
      };
    }
    if (!jsonPart) return { reply: conversational, recommended_build: null };
    return {
      reply: conversational,
      recommended_build: parsed.recommended_build || parsed || null,
      parsed,
    };
  } catch (_error) {
    return { reply: raw, recommended_build: null };
  }
}

module.exports = {
  providerErrorStatus,
  isRetryableProviderError,
  withTimeout,
  modelCandidates,
  createGenerationConfig,
  executeWithProvider,
  runWithFallback,
  generateContentWithFallback,
  consumeStreamWithFallback,
  responseText,
  parseModelResponse,
};
