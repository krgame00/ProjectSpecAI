require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../config/db');

function formatProductName(brand, model) {
  let b = (brand || '').trim();
  let m = (model || '').trim();

  // 1. Remove category prefixes (Thai & English)
  m = m.replace(/^(?:CPU\s*\(ซีพียู\)|MAINBOARD\s*\(เมนบอร์ด\)|RAM\s*\(แรม\)|VGA\s*\(การ์ดจอ\)|PSU\s*\(อุปกรณ์จ่ายไฟ\)|CASE\s*\(เคส\)|(?:M\.2|SSD)\s*\(เอสเอสดี\))\s*/i, '');
  m = m.replace(/^(?:CPU|MAINBOARD|RAM|VGA|PSU|CASE|SSD)\s+/i, '');

  // 2. Standardize brand
  if (b.toUpperCase() === 'INTEL') b = 'Intel';
  else if (b.toUpperCase() === 'AMD') b = 'AMD';
  else if (b.toUpperCase() === 'NEXT') b = 'AMD';

  // 3. Remove duplicate brand and socket prefixes like "INTEL 1700", "AMD AM4", "AM5", "1851"
  m = m.replace(/^(?:AMD|INTEL|NEXT)\s+/i, '');
  m = m.replace(/^(?:AM4|AM5|sTRX5|1700|1851|LGA1700|LGA1851)\s+/i, '');

  // 4. Remove scrape suffixes like GHz, Cores/Threads, tray/box/warranty badges
  m = m.replace(/\s*\b\d+(?:\.\d+)?\s*GHz\b.*/i, '');
  m = m.replace(/\s*\b\d+\s*C\s*\d+\s*T\b.*/i, '');
  m = m.replace(/\s*\([^)]*(?:TRAY|BOX|MPK|3Y|Synnex|WTG|NEXT|REV|V\.\d|384MB)[^)]*\)/gi, '');
  m = m.replace(/\s*\(3Y\)/gi, '');
  m = m.replace(/\s*\(TRAY\)/gi, '');
  m = m.replace(/\s*\(MPK\)/gi, '');
  m = m.replace(/\s*\(BOX\)/gi, '');
  m = m.replace(/\s*\(NEXT\)/gi, '');

  m = m.trim();

  // 5. Normalize CPU capitalization
  m = m.replace(/\bRYZEN\s+THREADRIPPER\s+PRO\s+/i, 'Ryzen Threadripper Pro ');
  m = m.replace(/\bTHREADRIPPER\s+PRO\s+/i, 'Ryzen Threadripper Pro ');
  m = m.replace(/\bCORE\s+ULTRA\s+(\d)/i, 'Core Ultra $1');
  m = m.replace(/\bULTRA\s+(\d)/i, 'Core Ultra $1');
  m = m.replace(/\bCORE\s+I(\d)/i, 'Core i$1');
  m = m.replace(/\bCORE\s+i(\d)/i, 'Core i$1');
  m = m.replace(/\bRYZEN\s+(\d)/i, 'Ryzen $1');
  m = m.replace(/\bATHLON\s+/i, 'Athlon ');
  m = m.replace(/\bPLUS\b/i, 'Plus');
  m = m.replace(/\bCore\s+Core\b/gi, 'Core');
  m = m.replace(/\bRyzen\s+Ryzen\b/gi, 'Ryzen');

  // Strip brand from model if already present at start
  if (b && m.toLowerCase().startsWith(b.toLowerCase())) {
    m = m.slice(b.length).trim();
  }

  return b ? `${b} ${m}` : m;
}

async function verifyAllCpuDisplayNames() {
  const [products] = await db.query(`
    SELECT p.*, cat.slug as category_slug
    FROM products p
    JOIN categories cat ON p.category_id = cat.id
    WHERE cat.slug = 'cpu'
    ORDER BY p.id ASC
  `);

  console.log(`Total CPU Products: ${products.length}`);
  products.forEach(p => {
    const formattedName = formatProductName(p.brand, p.model);
    console.log(`[${p.id}] "${formattedName}"`);
  });

  if (db.pool) await db.pool.end();
}

verifyAllCpuDisplayNames().catch(console.error);
