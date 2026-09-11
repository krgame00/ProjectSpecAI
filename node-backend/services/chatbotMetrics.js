function createChatbotMetrics({ now = () => Date.now() } = {}) {
  const records = [];
  return {
    startRequest({ route = 'ai' } = {}) {
      return { route, startedAt: now() };
    },
    finishRequest(context, details = {}) {
      const finishedAt = now();
      const record = {
        route: context?.route || 'ai',
        durationMs: Math.max(0, finishedAt - (context?.startedAt || finishedAt)),
        firstByteMs: details.firstByteAt && context?.startedAt
          ? Math.max(0, details.firstByteAt - context.startedAt)
          : null,
        model: details.model || null,
        fallbackCount: Number(details.fallbackCount || 0),
        cacheHit: Boolean(details.cacheHit),
        catalogCacheHit: details.catalogCacheHit == null ? null : Boolean(details.catalogCacheHit),
        catalogRetrievalMs: details.catalogRetrievalMs == null ? null : Number(details.catalogRetrievalMs),
        usedLiveSearch: Boolean(details.usedLiveSearch),
        outputLength: details.outputLength == null ? null : Number(details.outputLength),
        buildValidation: details.buildValidation || null,
        errorClass: details.errorClass || null,
        success: details.success !== false,
        finishedAt,
      };
      records.push(record);
      if (records.length > 500) records.shift();
      return record;
    },
    snapshot() { return records.map(record => ({ ...record })); },
    summarize(route) {
      const selected = records.filter(record => !route || record.route === route);
      if (!selected.length) return { count: 0, p50Ms: null, p95Ms: null, errorRate: 0, fallbackRate: 0 };
      const durations = selected.map(record => record.durationMs).sort((a, b) => a - b);
      const percentile = (ratio) => durations[Math.min(durations.length - 1, Math.floor((durations.length - 1) * ratio))];
      return {
        count: selected.length,
        p50Ms: percentile(0.5),
        p95Ms: percentile(0.95),
        errorRate: selected.filter(record => !record.success).length / selected.length,
        fallbackRate: selected.filter(record => record.fallbackCount > 0).length / selected.length,
      };
    },
    reset() { records.length = 0; },
  };
}

const chatbotMetrics = createChatbotMetrics();

module.exports = { createChatbotMetrics, chatbotMetrics };
