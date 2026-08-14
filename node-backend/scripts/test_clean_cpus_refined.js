require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

function cleanCpuName(brand, rawModel) {
  let m = rawModel;

  // 1. Remove category prefixes
  m = m.replace(/^CPU\s*\(ซีพียู\)\s*/i, '');
  m = m.replace(/^CPU\s+/i, '');

  // 2. Remove brand at the beginning if duplicated
  m = m.replace(/^AMD\s+/i, '');
  m = m.replace(/^INTEL\s+/i, '');
  m = m.replace(/^NEXT\s+/i, '');

  // 3. Remove socket prefixes like "AM4", "AM5", "sTRX5", "1700", "1851"
  m = m.replace(/^(?:AM4|AM5|sTRX5|1700|1851|LGA1700|LGA1851)\s+/i, '');

  // 4. Remove suffixes like GHz, Cores, Threads, Tray, Box, MPK, 3Y, Warranty, etc.
  m = m.replace(/\s*\b\d+(?:\.\d+)?\s*GHz\b.*/i, '');
  m = m.replace(/\s*\b\d+\s*C\s*\d+\s*T\b.*/i, '');
  m = m.replace(/\s*\([^)]*(?:TRAY|BOX|MPK|3Y|Synnex|WTG|NEXT|REV|V\.\d|384MB)[^)]*\)/gi, '');
  m = m.replace(/\s*\(3Y\)/gi, '');
  m = m.replace(/\s*\(TRAY\)/gi, '');
  m = m.replace(/\s*\(MPK\)/gi, '');
  m = m.replace(/\s*\(BOX\)/gi, '');
  m = m.replace(/\s*\(NEXT\)/gi, '');

  m = m.trim();

  // Normalize capitalization
  m = m.replace(/\bRYZEN\s+THREADRIPPER\s+PRO\s+/i, 'Ryzen Threadripper Pro ');
  m = m.replace(/\bTHREADRIPPER\s+PRO\s+/i, 'Ryzen Threadripper Pro ');
  m = m.replace(/\bCORE\s+ULTRA\s+(\d)/i, 'Core Ultra $1');
  m = m.replace(/\bULTRA\s+(\d)/i, 'Core Ultra $1');
  m = m.replace(/\bCORE\s+I(\d)/i, 'Core i$1');
  m = m.replace(/\bCORE\s+i(\d)/i, 'Core i$1');
  m = m.replace(/\bRYZEN\s+(\d)/i, 'Ryzen $1');
  m = m.replace(/\bATHLON\s+/i, 'Athlon ');
  m = m.replace(/\bPLUS\b/i, 'Plus');

  // Fix any "Core Core" or "Ryzen Ryzen"
  m = m.replace(/\bCore\s+Core\b/gi, 'Core');
  m = m.replace(/\bRyzen\s+Ryzen\b/gi, 'Ryzen');

  // Clean brand
  let b = brand.trim();
  if (b.toUpperCase() === 'INTEL') b = 'Intel';
  if (b.toUpperCase() === 'AMD') b = 'AMD';
  if (b.toUpperCase() === 'NEXT') b = 'AMD';

  // Fix model where brand is already in model
  if (m.toLowerCase().startsWith('amd ')) m = m.slice(4).trim();
  if (m.toLowerCase().startsWith('intel ')) m = m.slice(6).trim();

  return { brand: b, model: m, fullName: `${b} ${m}` };
}

async function testCleanCpus() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [cpus] = await connection.query(`SELECT id, brand, model FROM products WHERE category_id = 1 AND model NOT LIKE 'ALL %' ORDER BY id ASC`);

  console.log('=== TEST CLEAN CPU NAMES (SAMPLES) ===\n');
  cpus.slice(0, 25).forEach(c => {
    const cleaned = cleanCpuName(c.brand, c.model);
    console.log(`[${c.id}] BEFORE: "${c.brand}" "${c.model}"`);
    console.log(`       AFTER:  "${cleaned.fullName}"\n`);
  });

  await connection.end();
}

testCleanCpus().catch(console.error);
