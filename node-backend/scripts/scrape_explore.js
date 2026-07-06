const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewport({ width: 1280, height: 800 });

  // Intercept requests to see if there's a JSON API
  const apiRequests = [];
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('api') && url.includes('advice.co.th')) {
      try {
        const text = await response.text();
        apiRequests.push({ url, preview: text.slice(0, 500) });
      } catch (e) {}
    }
  });

  console.log('Navigating to advice.co.th/pc-spec...');
  await page.goto('https://www.advice.co.th/pc-spec', { waitUntil: 'networkidle2' });

  console.log('Saving screenshot and DOM...');
  await page.screenshot({ path: 'advice_spec.png' });
  const html = await page.content();
  fs.writeFileSync('advice_dom.html', html);
  fs.writeFileSync('advice_apis.json', JSON.stringify(apiRequests, null, 2));

  console.log('Exploration complete.');
  await browser.close();
})();
