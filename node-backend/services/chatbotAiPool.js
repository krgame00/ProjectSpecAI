function normalizeKey(value) {
  if (typeof value !== 'string') return '';
  const key = value.trim();
  if (!key || /your[_-]?gemini/i.test(key)) return '';
  return key;
}

function parseGeminiApiKeys(env = process.env) {
  const candidates = [];

  if (typeof env.GEMINI_API_KEYS === 'string') {
    candidates.push(...env.GEMINI_API_KEYS.split(/[\n,;]+/));
  }

  for (let index = 1; index <= 5; index += 1) {
    candidates.push(env[`GEMINI_API_KEY_${index}`]);
  }

  candidates.push(env.GEMINI_API_KEY);

  const unique = [];
  const seen = new Set();
  for (const candidate of candidates) {
    const key = normalizeKey(candidate);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(key);
    if (unique.length >= 5) break;
  }

  return unique;
}

function providerStatus(error) {
  const value = Number(error?.status ?? error?.statusCode ?? error?.code);
  return Number.isFinite(value) ? value : null;
}

function isQuotaExhaustionError(error) {
  if (providerStatus(error) === 429) return true;
  const message = String(error?.message || error || '').toLowerCase();
  return /resource_exhausted|too many requests|rate.?limit|quota(?:\s|_|-)*(?:exceeded|exhausted|limit)/i.test(message);
}

function createGeminiAiPool({ GoogleGenAI, env = process.env, logger = console } = {}) {
  if (typeof GoogleGenAI !== 'function') {
    throw new TypeError('GoogleGenAI constructor is required');
  }

  const apiKeys = parseGeminiApiKeys(env);
  const explicitPoolKeys = parseGeminiApiKeys({ ...env, GEMINI_API_KEY: '' });
  let mode = 'none';
  let clients = [];

  if (explicitPoolKeys.length > 0) {
    mode = 'api-key-pool';
    clients = apiKeys.map((apiKey) => new GoogleGenAI({ apiKey }));
  } else if (env.GCP_PROJECT) {
    mode = 'vertex';
    clients = [new GoogleGenAI({
      vertexai: {
        project: env.GCP_PROJECT,
        location: env.GCP_LOCATION || 'us-central1',
      },
    })];
  } else if (apiKeys.length > 0) {
    mode = 'api-key-pool';
    clients = apiKeys.map((apiKey) => new GoogleGenAI({ apiKey }));
  }

  let activeIndex = 0;

  async function runWithQuotaFailover(operation, { onSwitch } = {}) {
    if (typeof operation !== 'function') {
      throw new TypeError('Gemini operation must be a function');
    }
    if (clients.length === 0) {
      const error = new Error('Gemini provider is not configured');
      error.code = 'GEMINI_NOT_CONFIGURED';
      throw error;
    }

    if (mode !== 'api-key-pool' || clients.length === 1) {
      return {
        result: await operation(clients[0], {
          providerIndex: 0,
          providerCount: clients.length,
          mode,
        }),
        providerIndex: 0,
        providerCount: clients.length,
        mode,
      };
    }

    const startIndex = activeIndex;
    let lastError;

    for (let attempt = 0; attempt < clients.length; attempt += 1) {
      const providerIndex = (startIndex + attempt) % clients.length;
      try {
        const result = await operation(clients[providerIndex], {
          providerIndex,
          providerCount: clients.length,
          mode,
        });
        activeIndex = providerIndex;
        return {
          result,
          providerIndex,
          providerCount: clients.length,
          mode,
        };
      } catch (error) {
        lastError = error;
        const hasNext = attempt < clients.length - 1;
        if (!hasNext || !isQuotaExhaustionError(error)) {
          throw error;
        }

        const nextIndex = (providerIndex + 1) % clients.length;
        activeIndex = nextIndex;
        logger?.warn?.(`Gemini API key #${providerIndex + 1} quota exhausted; switching to key #${nextIndex + 1}.`);
        if (onSwitch) {
          await onSwitch({
            error,
            fromIndex: providerIndex,
            toIndex: nextIndex,
            providerCount: clients.length,
          });
        }
      }
    }

    throw lastError || new Error('All Gemini API keys are unavailable');
  }

  return {
    mode,
    providerCount: clients.length,
    hasProvider: () => clients.length > 0,
    runWithQuotaFailover,
  };
}

module.exports = {
  parseGeminiApiKeys,
  isQuotaExhaustionError,
  createGeminiAiPool,
};
