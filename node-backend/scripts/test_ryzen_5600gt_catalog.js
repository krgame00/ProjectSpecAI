require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../config/db');

function formatProductName(brand, model) {
  let b = (brand || '').trim();
  let m = (model || '').trim();
  m = m.replace(/^(?:CPU\s*\(ซีพียู\)|MAINBOARD\s*\(เมนบอร์ด\)|RAM\s*\(แรม\)|VGA\s*\(การ์ดจอ\)|PSU\s*\(อุปกรณ์จ่ายไฟ\)|CASE\s*\(เคส\)|(?:M\.2|SSD)\s*\(เอสเอสดี\))\s*/i, '');
  m = m.replace(/^(?:CPU|MAINBOARD|RAM|VGA|PSU|CASE|SSD)\s+/i, '');
  if (b.toUpperCase() === 'INTEL') b = 'Intel';
  else if (b.toUpperCase() === 'AMD') b = 'AMD';
  else if (b.toUpperCase() === 'NEXT') b = 'AMD';
  m = m.replace(/^(?:AMD|INTEL|NEXT)\s+/i, '');
  m = m.replace(/^(?:AM4|AM5|sTRX5|1700|1851|LGA1700|LGA1851)\s+/i, '');
  m = m.replace(/\s*\b\d+(?:\.\d+)?\s*GHz\b.*/i, '');
  m = m.replace(/\s*\b\d+\s*C\s*\d+\s*T\b.*/i, '');
  m = m.replace(/\s*\([^)]*(?:TRAY|BOX|MPK|3Y|Synnex|WTG|NEXT|REV|V\.\d|384MB)[^)]*\)/gi, '');
  m = m.replace(/\s*\(3Y\)/gi, '');
  m = m.replace(/\s*\(TRAY\)/gi, '');
  m = m.replace(/\s*\(MPK\)/gi, '');
  m = m.replace(/\s*\(BOX\)/gi, '');
  m = m.replace(/\s*\(NEXT\)/gi, '');
  m = m.trim();
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
  if (b && m.toLowerCase().startsWith(b.toLowerCase())) {
    m = m.slice(b.length).trim();
  }
  return b ? `${b} ${m}` : m;
}

async function testRyzen5600gtCatalog() {
  const queryStr = `
    SELECT p.*, cat.slug as category_slug,
           c.socket as cpu_socket, c.cores as cpu_cores, c.threads as cpu_threads, c.tdp_watt as cpu_tdp
    FROM products p
    JOIN categories cat ON p.category_id = cat.id
    LEFT JOIN spec_cpu c ON p.id = c.product_id AND cat.slug = 'cpu'
    WHERE cat.slug = 'cpu' AND (p.model LIKE '%5600%' OR p.model LIKE '%12400%' OR p.model LIKE '%14100%')
    ORDER BY p.id ASC
  `;

  const [products] = await db.query(queryStr);
  console.log('Sample CPU results:');
  products.forEach(p => {
    console.log(`[${p.id}] ${formatProductName(p.brand, p.model)} -> Socket: ${p.cpu_socket} | Cores: ${p.cpu_cores} | Threads: ${p.cpu_threads} | TDP: ${p.cpu_tdp}W`);
    console.log('  Clean Specs JSON:', typeof p.specifications === 'string' ? JSON.parse(p.specifications) : p.specifications);
  });

  if (db.pool) await db.pool.end();
}

testRyzen5600gtCatalog().catch(console.error);
