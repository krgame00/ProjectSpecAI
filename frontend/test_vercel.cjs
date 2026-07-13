const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('request', request => console.log('>>', request.method(), request.url()));
  page.on('response', response => console.log('<<', response.status(), response.url()));
  page.on('dialog', async dialog => {
    console.log('ALERT:', dialog.message());
    await dialog.accept();
  });
  await page.goto('https://project-spec-ai.vercel.app');
  await page.click('button:has-text("เข้าสู่ระบบ")');
  await page.fill('input[type="email"]', 'admin@pc.com');
  await page.fill('input[type="password"]', 'admin');
  await page.click('.modal-overlay button.btn-primary:has-text("เข้าสู่ระบบ")');
  await page.waitForTimeout(2000);
  await browser.close();
})();
