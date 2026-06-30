const puppeteer = require('puppeteer'); 
async function run() { 
  const browser = await puppeteer.launch({headless: 'new'}); 
  const page = await browser.newPage(); 
  await page.goto('http://localhost:5173', {waitUntil: 'networkidle0'}); 
  const priceBefore = await page.evaluate(() => {
    const el = document.querySelector('.price-val, .total-price, .price'); 
    return el ? el.innerText : 'not found';
  });
  console.log('Price before:', priceBefore); 
  
  await page.click('.chat-fab'); 
  await page.waitForSelector('.preset-btn'); 
  await page.click('.preset-btn'); 
  await new Promise(r => setTimeout(r, 1000)); 
  
  const priceAfter = await page.evaluate(() => {
    const el = document.querySelector('.price-val, .total-price, .price'); 
    return el ? el.innerText : 'not found';
  });
  console.log('Price after:', priceAfter); 
  
  const chatMessages = await page.evaluate(() => Array.from(document.querySelectorAll('.msg-bubble')).map(e => e.innerText));
  console.log('Chat messages:', chatMessages);
  
  await browser.close(); 
} 
run().catch(console.error);
