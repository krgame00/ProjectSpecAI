const { createChatbotMetrics } = require('../services/chatbotMetrics');

test('records route/model/fallback metrics without prompt contents', () => {
  let clock = 100;
  const metrics = createChatbotMetrics({ now: () => clock });
  const context = metrics.startRequest({ route: 'catalog' });
  clock = 140;
  metrics.finishRequest(context, { model: 'primary', fallbackCount: 1, firstByteAt: 120 });
  expect(metrics.snapshot()[0]).toMatchObject({ route: 'catalog', durationMs: 40, firstByteMs: 20, fallbackCount: 1 });
  expect(JSON.stringify(metrics.snapshot())).not.toContain('prompt');
  expect(metrics.summarize('catalog')).toMatchObject({ count: 1, p50Ms: 40, p95Ms: 40, errorRate: 0, fallbackRate: 1 });
});
