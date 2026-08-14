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
  m = m.replace(/\s*\b\d+(?:\.\d+)?\s*GHz\b.*/i, ''); // removes e.g. " 3.6GHz 6C 12T (MPK) (3Y)"
  m = m.replace(/\s*\b\d+\s*C\s*\d+\s*T\b.*/i, '');
  m = m.replace(/\s*\([^)]*(?:TRAY|BOX|MPK|3Y|Synnex|WTG|NEXT|REV|V\.\d|384MB)[^)]*\)/gi, '');
  m = m.replace(/\s*\(3Y\)/gi, '');
  m = m.replace(/\s*\(TRAY\)/gi, '');
  m = m.replace(/\s*\(MPK\)/gi, '');
  m = m.replace(/\s*\(BOX\)/gi, '');

  m = m.trim();

  // Normalize capitalization for Core / Ryzen / Ultra
  m = m.replace(/\bCORE\s+I(\d)/i, 'Core i$1');
  m = m.replace(/\bCORE\s+ULTRA\s+(\d)/i, 'Core Ultra $1');
  m = m.replace(/\bULTRA\s+(\d)/i, 'Core Ultra $1');
  m = m.replace(/\bRYZEN\s+(\d)/i, 'Ryzen $1');
  m = m.replace(/\bATHLON\s+/i, 'Athlon ');
  m = m.replace(/\bTHREADRIPPER\s+PRO\s+/i, 'Ryzen Threadripper Pro ');

  // Clean brand
  let b = brand.trim();
  if (b.toUpperCase() === 'INTEL') b = 'Intel';
  if (b.toUpperCase() === 'AMD') b = 'AMD';
  if (b.toUpperCase() === 'NEXT') b = 'AMD'; // Next Athlon/Ryzen are AMD CPUs

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

  const [cpus] = await connection.query(`SELECT id, brand, model FROM products WHERE category_id = 1 ORDER BY id ASC`);

  console.log('=== BEFORE vs AFTER CLEANING CPU NAMES ===\n');
  cpus.forEach(c => {
    const cleaned = cleanCpuName(c.brand, c.model);
    console.log(`[${c.id}] BEFORE: "${c.brand}" "${c.model}"`);
    console.log(`       AFTER:  Brand: "${cleaned.brand}" | Model: "${cleaned.model}" | Full: "${cleaned.fullName}"\n`);
  });

  await connection.end();
}

testCleanCpus().catch(console.error);
