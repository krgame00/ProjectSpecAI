/*
 * Lightweight deployment benchmark. It sends only synthetic prompts and
 * reports latency/error/fallback aggregates; prompts and responses are never
 * written to disk or logged.
 *
 * Usage:
 *   CHATBOT_BENCHMARK_BASE_URL=https://.../api/v1/chatbot \
 *   CHATBOT_BENCHMARK_TOKEN=... CHATBOT_BENCHMARK_ROUNDS=20 \
 *   node scripts/chatbot_benchmark.js
 */
const { summarize } = require('./chatbot_benchmark_lib');

async function measure({ baseUrl, token, path, body, rounds }) {
  const results = [];
  for (let index = 0; index < rounds; index += 1) {
    const startedAt = Date.now();
    let success = false;
    let fallbackCount = 0;
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      success = response.ok;
      const header = response.headers.get('x-chatbot-fallback-count');
      fallbackCount = Number.parseInt(header || '0', 10) || 0;
      await response.arrayBuffer();
    } catch (_error) {
      success = false;
    }
    results.push({ durationMs: Date.now() - startedAt, success, fallbackCount });
  }
  return results;
}

async function main(env = process.env) {
  const baseUrl = env.CHATBOT_BENCHMARK_BASE_URL;
  const token = env.CHATBOT_BENCHMARK_TOKEN;
  const rounds = Math.max(20, Number.parseInt(env.CHATBOT_BENCHMARK_ROUNDS || '20', 10));
  if (!baseUrl || !token) throw new Error('CHATBOT_BENCHMARK_BASE_URL and CHATBOT_BENCHMARK_TOKEN are required');
  const paths = [
    { name: 'fast', path: '/message', body: { message: 'สวัสดีครับ', history: [] } },
    { name: 'ai', path: '/message', body: { message: 'อธิบายความต่างของ DDR4 กับ DDR5', history: [] } },
    { name: 'catalog', path: '/message', body: { message: 'ช่วยจัดสเปค งบ 40000', history: [] } },
    { name: 'live_search', path: '/message', body: { message: 'ราคา GPU ล่าสุดวันนี้', history: [] } },
    { name: 'catalog_live_search', path: '/message', body: { message: 'จัดคอมงบ 40000 แล้วเช็กราคาตลาดล่าสุด', history: [] } },
  ];
  const output = {};
  for (const route of paths) {
    output[route.name] = summarize(await measure({ baseUrl, token, ...route, rounds }));
  }
  process.stdout.write(`${JSON.stringify({ rounds, output })}\n`);
  return output;
}

if (require.main === module) main().catch(error => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });

module.exports = { measure, main };
