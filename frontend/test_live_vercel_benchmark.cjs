const { chromium } = require('playwright');
const { performance } = require('perf_hooks');

(async () => {
  console.log('================================================================');
  console.log('🚀 TESTING LIVE PRODUCTION WEBSITE: https://project-spec-ai.vercel.app/');
  console.log('================================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const benchmarkResults = {};
  const rounds = 5;

  // 1. Measure Live Initial Page Load (5 times)
  const pageLoadTimes = [];
  for (let i = 1; i <= rounds; i++) {
    const t0 = performance.now();
    await page.goto('https://project-spec-ai.vercel.app/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.builder-container, nav, .hero-section, body');
    const t1 = performance.now();
    pageLoadTimes.push((t1 - t0) / 1000);
    console.log(`[Round ${i}] Initial Page Load: ${((t1 - t0) / 1000).toFixed(2)}s`);
  }
  benchmarkResults['page_load'] = pageLoadTimes;

  // 2. Measure Catalog API & Hardware Rendering
  const catalogTimes = [];
  for (let i = 1; i <= rounds; i++) {
    const t0 = performance.now();
    await page.goto('https://project-spec-ai.vercel.app/build', { waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(500);
    const t1 = performance.now();
    catalogTimes.push((t1 - t0) / 1000);
    console.log(`[Round ${i}] Catalog Load & Hardware List: ${((t1 - t0) / 1000).toFixed(2)}s`);
  }
  benchmarkResults['catalog_load'] = catalogTimes;

  // 3. Measure Live Search & Filter
  const searchTimes = [];
  for (let i = 1; i <= rounds; i++) {
    const t0 = performance.now();
    const searchInput = await page.$('input[placeholder*="ค้นหา"], input[type="text"]');
    if (searchInput) {
      await searchInput.fill('');
      await searchInput.fill('Ryzen');
      await page.waitForTimeout(50);
    }
    const t1 = performance.now();
    searchTimes.push((t1 - t0) / 1000);
    console.log(`[Round ${i}] Search & Filter: ${((t1 - t0) / 1000).toFixed(3)}s`);
  }
  benchmarkResults['search_filter'] = searchTimes;

  // 4. Measure Component Selection, Compatibility Check & Price Calculation
  const selectTimes = [];
  for (let i = 1; i <= rounds; i++) {
    const t0 = performance.now();
    const selectBtn = await page.$('.hardware-card button, .item-card button, button:has-text("เลือก")');
    if (selectBtn) {
      await selectBtn.click().catch(() => {});
      await page.waitForTimeout(50);
    }
    const t1 = performance.now();
    selectTimes.push((t1 - t0) / 1000);
    console.log(`[Round ${i}] Item Selection & Real-time Calc: ${((t1 - t0) / 1000).toFixed(3)}s`);
  }
  benchmarkResults['select_calc'] = selectTimes;

  // 5. Measure User Login on Live Vercel
  const loginTimes = [];
  for (let i = 1; i <= rounds; i++) {
    const t0 = performance.now();
    const loginBtn = await page.$('button:has-text("เข้าสู่ระบบ")');
    if (loginBtn) {
      await loginBtn.click().catch(() => {});
      await page.fill('input[type="email"]', 'admin@pc.com').catch(() => {});
      await page.fill('input[type="password"]', 'admin').catch(() => {});
      const submitBtn = await page.$('.modal-overlay button.btn-primary, button[type="submit"]');
      if (submitBtn) await submitBtn.click().catch(() => {});
      await page.waitForTimeout(300);
    }
    const t1 = performance.now();
    loginTimes.push((t1 - t0) / 1000);
    console.log(`[Round ${i}] User Login (Auth Flow): ${((t1 - t0) / 1000).toFixed(2)}s`);
  }
  benchmarkResults['login'] = loginTimes;

  // 6. Measure AI Chatbot (SpecAI) Live Response Time
  const chatbotTimes = [];
  console.log('\nTesting Live AI Chatbot (SpecAI)...');
  for (let i = 1; i <= rounds; i++) {
    const t0 = performance.now();
    const chatToggle = await page.$('.chatbot-toggle-btn, button:has-text("AI"), .floating-chatbot-btn');
    if (chatToggle) {
      await chatToggle.click().catch(() => {});
      await page.waitForTimeout(300);
    }
    const chatInput = await page.$('.chatbot-input input, textarea, input[placeholder*="พิมพ์คำถาม"]');
    if (chatInput) {
      await chatInput.fill('สเปคคอมงบ 20000 เล่นเกม');
      const sendBtn = await page.$('.chatbot-send-btn, button:has-text("ส่ง")');
      if (sendBtn) await sendBtn.click().catch(() => {});
      // Wait for AI response or timeout
      await page.waitForTimeout(1800);
    }
    const t1 = performance.now();
    chatbotTimes.push((t1 - t0) / 1000);
    console.log(`[Round ${i}] AI Chatbot Response: ${((t1 - t0) / 1000).toFixed(2)}s`);
  }
  benchmarkResults['chatbot'] = chatbotTimes;

  await browser.close();

  console.log('\n================================================================');
  console.log('📊 FINAL LIVE BENCHMARK SUMMARY (AVERAGE ACROSS 5 ROUNDS)');
  console.log('================================================================');
  for (const [key, times] of Object.entries(benchmarkResults)) {
    const avg = (times.reduce((a, b) => a + b, 0) / times.length).toFixed(3);
    console.log(`${key.toUpperCase().padEnd(20)}: [${times.map(t => t.toFixed(2)).join(', ')}] s  =>  AVG = ${avg}s`);
  }
})();
