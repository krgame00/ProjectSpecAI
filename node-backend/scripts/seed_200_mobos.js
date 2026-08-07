require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const BRANDS = ['ASUS', 'GIGABYTE', 'MSI', 'ASROCK', 'COLORFUL', 'BIOSTAR'];

const CHIPSETS = [
  // Intel Socket LGA1700
  { chipset: 'Intel H610', socket: 'LGA1700', defaultRam: 'DDR4', basePrice: 2290 },
  { chipset: 'Intel B760', socket: 'LGA1700', defaultRam: 'DDR5', basePrice: 4890 },
  { chipset: 'Intel Z790', socket: 'LGA1700', defaultRam: 'DDR5', basePrice: 9990 },

  // Intel Socket LGA1851 (Z890 / B860)
  { chipset: 'Intel Z890', socket: 'LGA1851', defaultRam: 'DDR5', basePrice: 12900 },
  { chipset: 'Intel B860', socket: 'LGA1851', defaultRam: 'DDR5', basePrice: 5900 },

  // AMD Socket AM5 (B650 / X670 / X870 / B850)
  { chipset: 'AMD B650', socket: 'AM5', defaultRam: 'DDR5', basePrice: 5490 },
  { chipset: 'AMD X670', socket: 'AM5', defaultRam: 'DDR5', basePrice: 10900 },
  { chipset: 'AMD X670E', socket: 'AM5', defaultRam: 'DDR5', basePrice: 14900 },
  { chipset: 'AMD X870', socket: 'AM5', defaultRam: 'DDR5', basePrice: 11900 },
  { chipset: 'AMD X870E', socket: 'AM5', defaultRam: 'DDR5', basePrice: 16900 },
  { chipset: 'AMD B850', socket: 'AM5', defaultRam: 'DDR5', basePrice: 6200 },

  // AMD Socket AM4 (A520 / B550 / X570)
  { chipset: 'AMD A520', socket: 'AM4', defaultRam: 'DDR4', basePrice: 1890 },
  { chipset: 'AMD B550', socket: 'AM4', defaultRam: 'DDR4', basePrice: 3490 },
  { chipset: 'AMD X570', socket: 'AM4', defaultRam: 'DDR4', basePrice: 6990 }
];

const SERIES = ['PRIME', 'TUF GAMING', 'ROG STRIX', 'AORUS ELITE', 'AORUS MASTER', 'GAMING X', 'DS3H', 'PRO', 'MAG MORTAR', 'MAG TOMAHAWK', 'MPG EDGE', 'MEG ACE', 'Pro RS', 'Steel Legend', 'Taichi', 'Phantom Gaming', 'CVN', 'COLORFUL BATTLE-AX', 'RACING'];

const FORM_FACTORS = ['ATX', 'Micro-ATX', 'Mini-ITX', 'E-ATX'];
const RAM_OPTIONS = ['DDR4', 'DDR5'];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed200Mobos() {
  console.log('🔌 Connecting to MySQL database...');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [existing] = await conn.query('SELECT id, model FROM products WHERE category_id = 2');
  console.log(`📊 Current Motherboard count in DB: ${existing.length} items`);

  const targetCount = 200;
  const needed = targetCount - existing.length;

  if (needed <= 0) {
    console.log(`✅ DB already has ${existing.length} Motherboards (>= 200). No more items needed.`);
    await conn.end();
    return;
  }

  console.log(`🚀 Adding ${needed} unique Motherboard items to reach 200 total...`);

  const existingModels = new Set(existing.map(e => e.model.toLowerCase()));
  let added = 0;
  let attempts = 0;

  while (added < needed && attempts < 2000) {
    attempts++;
    const brand = getRandomItem(BRANDS);
    const chipObj = getRandomItem(CHIPSETS);
    const series = getRandomItem(SERIES);
    const ff = getRandomItem(FORM_FACTORS);

    // RAM Type logic
    let ramType = chipObj.defaultRam;
    if (chipObj.socket === 'LGA1700' && chipObj.chipset !== 'Intel Z790') {
      ramType = attempts % 2 === 0 ? 'DDR4' : 'DDR5';
    }

    const ddrSuffix = ramType === 'DDR4' ? 'DDR4' : 'D5';
    const formCode = ff === 'Micro-ATX' ? 'M-' : (ff === 'Mini-ITX' ? '-I ' : ' ');
    
    const fullModel = `${series} ${chipObj.chipset.replace(/Intel\s*|AMD\s*/i, '')}${formCode.trim()} ${ddrSuffix} (V.${(attempts % 3) + 1})`;
    const fullProductName = `${brand} ${fullModel}`;

    if (existingModels.has(fullProductName.toLowerCase()) || existingModels.has(fullModel.toLowerCase())) {
      continue;
    }
    existingModels.add(fullProductName.toLowerCase());

    const baseP = chipObj.basePrice;
    const ffMultiplier = ff === 'Mini-ITX' ? 1.3 : (ff === 'E-ATX' ? 1.4 : 1.0);
    const brandMultiplier = (series.includes('ROG') || series.includes('MASTER') || series.includes('Taichi') || series.includes('ACE')) ? 1.5 : 1.0;
    
    const price = Math.round((baseP * ffMultiplier * brandMultiplier + (attempts % 5) * 200) / 10) * 10;
    const img = 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/product1048_800.jpg';

    const specsJson = JSON.stringify({
      "Brand": brand,
      "Chipset": chipObj.chipset,
      "CPU Socket": chipObj.socket,
      "Memory Type": ramType,
      "Form Factor": ff,
      "Memory Slots": "4 x DIMM",
      "LAN Speed": "2.5 Gbps"
    });

    const [res] = await conn.query(
      `INSERT INTO products (category_id, brand, model, price, image_url, stock_quantity, specifications)
       VALUES (2, ?, ?, ?, ?, 10, ?)`,
      [brand, fullModel, price, img, specsJson]
    );

    const pid = res.insertId;

    await conn.query(
      `INSERT INTO spec_motherboard (product_id, socket, ram_type, form_factor)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE socket=VALUES(socket), ram_type=VALUES(ram_type), form_factor=VALUES(form_factor)`,
      [pid, chipObj.socket, ramType, ff]
    );

    added++;
  }

  const [finalCount] = await conn.query('SELECT count(*) as total FROM products WHERE category_id = 2');
  console.log(`\n🎉 Done! Added ${added} Motherboard items. Total Motherboard count in DB is now: ${finalCount[0].total} items!`);

  await conn.end();
}

seed200Mobos().catch(err => {
  console.error('❌ Motherboard Seeding error:', err);
  process.exit(1);
});
