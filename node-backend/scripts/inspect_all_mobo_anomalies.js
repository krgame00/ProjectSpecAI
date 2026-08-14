require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function inspectAllMoboAnomalies() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  console.log('=== MOTHERBOARD DEEP INSPECTION ===\n');

  const [mobos] = await connection.query(`
    SELECT p.id, p.brand, p.model, m.socket, m.ram_type, m.form_factor
    FROM products p
    JOIN spec_motherboard m ON p.id = m.product_id
    WHERE p.category_id = 2
    ORDER BY p.id ASC
  `);

  console.log(`Total Motherboards: ${mobos.length}`);
  const badMobos = [];

  for (const m of mobos) {
    const full = `${m.brand} ${m.model}`.toUpperCase();
    let expectedSocket = m.socket;

    // Chipset to real socket mapping
    if (/\b(?:A320|B350|X370|A520|B450|B550|X470|X570)\b/.test(full) || full.includes('AM4')) {
      expectedSocket = 'AM4';
    } else if (/\b(?:A620|B650|B840|B850|X670|X870)\b/.test(full) || full.includes('AM5')) {
      expectedSocket = 'AM5';
    } else if (/\b(?:H610|B660|B760|Z690|Z790)\b/.test(full) || full.includes('1700') || full.includes('LGA1700')) {
      expectedSocket = 'LGA1700';
    } else if (/\b(?:B860|Z890|H810)\b/.test(full) || full.includes('1851') || full.includes('LGA1851')) {
      expectedSocket = 'LGA1851';
    } else if (/\b(?:H61|H81|B75|B85|H77|Z77|H110|B150|B250|B360|Z370|Z390|1155|1150|1151|1200)\b/.test(full)) {
      if (full.includes('H77') || full.includes('H61') || full.includes('1155')) expectedSocket = 'LGA1155';
    }

    const socketMismatch = expectedSocket !== m.socket;
    const weirdBrand = m.brand === 'iHAVECPU' || m.brand === 'Generic' || m.brand === 'ALL';
    const dirtyModel = /\([1235]Y\)|\(LT\)|\(AM4\)|\(AM5\)|\(REV|\(CSM\)|MAINBOARD/i.test(m.model) || m.model.toUpperCase().startsWith(m.brand.toUpperCase());

    if (socketMismatch || weirdBrand || dirtyModel) {
      badMobos.push({ id: m.id, brand: m.brand, model: m.model, currentSocket: m.socket, expectedSocket, socketMismatch, weirdBrand });
    }
  }

  console.log(`Found ${badMobos.length} motherboards with socket mismatches, weird brands, or dirty model names:`);
  badMobos.forEach(b => {
    console.log(`[${b.id}] Brand: "${b.brand}" | Model: "${b.model}" | Socket in DB: ${b.currentSocket} (Expected: ${b.expectedSocket})`);
  });

  await connection.end();
}

inspectAllMoboAnomalies().catch(console.error);
