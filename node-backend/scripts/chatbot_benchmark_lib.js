function summarize(records = []) {
  const durations = records.map(item => item.durationMs).filter(Number.isFinite).sort((a, b) => a - b);
  if (!durations.length) return { count: 0, p50Ms: null, p95Ms: null, errorRate: 1, fallbackRate: 0 };
  const percentile = ratio => durations[Math.min(durations.length - 1, Math.floor((durations.length - 1) * ratio))];
  return {
    count: records.length,
    p50Ms: percentile(0.5),
    p95Ms: percentile(0.95),
    errorRate: records.filter(item => !item.success).length / records.length,
    fallbackRate: records.filter(item => Number(item.fallbackCount) > 0).length / records.length,
  };
}

module.exports = { summarize };
