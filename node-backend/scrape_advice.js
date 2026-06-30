const puppeteer = require('puppeteer');
const fs = require('fs');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const TARGETS = [
  { name: 'CPU', id: 'cpu', dbCat: 1 },
  { name: 'Mainboard', id: 'mobo', dbCat: 2 },
  { name: 'RAM', id: 'ram', dbCat: 3 },
  { name: 'Graphics Card (GPU)', id: 'gpu', dbCat: 4 },
  { name: 'Solid State Drive (SSD)', id: 'storage', dbCat: 5 },
  { name: 'Power Supply', id: 'psu', dbCat: 6 },
  { name: 'PC Case', id: 'case', dbCat: 7 }
];

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('Going to advice.co.th/pc-spec...');
  await page.goto('https://www.advice.co.th/pc-spec', { waitUntil: 'networkidle2' });

  // Accept cookies if present to remove overlay
  try {
    const cookieBtn = await page.$$('::-p-xpath(//button[contains(text(), "ยอมรับทั้งหมด")])');
    if (cookieBtn.length > 0) {
      await cookieBtn[0].click();
      await delay(1000);
    }
  } catch(e) {}

  const results = {};

  for (let target of TARGETS) {
    console.log(`\n--- Scraping ${target.name} ---`);
    results[target.id] = [];
    
    // Click category in sidebar
    try {
      const clicked = await page.evaluate((name) => {
        const els = Array.from(document.querySelectorAll('div, span'));
        // Find the element with exact text and no children containing the same text
        const el = els.find(b => b.innerText && b.innerText.trim() === name && Array.from(b.children).every(c => !c.innerText || !c.innerText.includes(name)));
        if (el) {
          el.click();
          return true;
        }
        return false;
      }, target.name);

      if (clicked) {
        // Wait for previous list to clear or be ready
        await delay(1000);
        
        // Wait for loader to disappear
        await page.waitForFunction(() => {
          return !document.body.innerText.includes('กรุณารอสักครู่');
        }, { timeout: 15000 }).catch(() => console.log('Wait for loader timed out'));
        
        await delay(2000); // extra wait for render
        
        // Try to scroll down to load lazy items
        for(let i=0; i<3; i++){
            await page.mouse.wheel({ deltaY: 1000 });
            await delay(500);
        }

        // Extract products
        const products = await page.evaluate((categoryName) => {
          const items = [];
          const cards = document.querySelectorAll('.product-list-item, .card-product, .item-product, .col-product, .box-item');
          
          // Let's try finding by typical Advice classes
          let list = Array.from(document.querySelectorAll('.card, .product-item')).filter(el => el.innerText.includes('บาท'));
          if(list.length === 0) {
             // Fallback broad selector
             list = Array.from(document.querySelectorAll('div')).filter(el => 
               el.style.border && el.innerText.includes('บาท') && el.innerText.match(/\d+/)
             );
          }

          // If still no luck, try looking for price class
          const priceEls = document.querySelectorAll('.price, .text-price, [class*="price"]');
          const cardsFromPrice = Array.from(priceEls).map(el => el.closest('.col-12, .col-md-6, .col-lg-4, .card, [class*="product"]')).filter(Boolean);
          const uniqueCards = [...new Set(cardsFromPrice)];
          
          let count = 0;
          for (let card of uniqueCards) {
            if (count >= 40) break;
            const text = card.innerText || '';
            if(!text.includes('บาท') && !text.match(/฿\s*[\d,]+/)) continue;
            
            // basic parsing
            const lines = text.split('\n').map(t=>t.trim()).filter(Boolean);
            const priceLine = lines.find(l => l.includes('บาท') || l.match(/^[\d,]+$/));
            const price = priceLine ? parseInt(priceLine.replace(/\D/g, '')) : 0;
            
            const nameLine = lines.find(l => l.length > 10 && !l.includes('บาท'));
            const brand = nameLine ? nameLine.split(' ')[0] : 'Unknown';
            const model = nameLine ? nameLine.substring(brand.length).trim() : 'Unknown';

            const imgEl = card.querySelector('img');
            const img = imgEl ? imgEl.src : '';

            if(price > 0 && nameLine) {
              items.push({
                brand,
                model,
                price,
                image_url: img,
                name: nameLine
              });
              count++;
            }
          }
          return items;
        }, target.name);

        console.log(`Found ${products.length} items for ${target.name}`);
        results[target.id] = products;

      } else {
        console.log(`Category button for ${target.name} not found!`);
      }
    } catch (err) {
      console.log(`Error scraping ${target.name}:`, err.message);
    }
  }

  fs.writeFileSync('advice_scraped_raw.json', JSON.stringify(results, null, 2));
  console.log('\n✅ Scraping finished, saved to advice_scraped_raw.json');
  await browser.close();
})();
