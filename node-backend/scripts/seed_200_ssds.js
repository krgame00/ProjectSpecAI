require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');
const fs = require('fs');

const BRANDS = ['SAMSUNG', 'WD', 'KINGSTON', 'ADATA', 'LEXAR', 'CORSAIR', 'CRUCIAL', 'SEAGATE', 'TEAMGROUP', 'KIOXIA', 'TRANSCEND', 'GIGABYTE', 'MSI', 'PATRIOT'];

const BRAND_MODELS = {
  'SAMSUNG': ['970 EVO PLUS', '980 PRO', '990 PRO', '990 EVO', '870 EVO', '870 QVO', 'T7 Shield', '980 NVMe'],
  'WD': ['BLACK SN850X', 'BLACK SN770', 'BLUE SN580', 'BLUE SN570', 'GREEN SN350', 'RED SA500', 'BLACK SN850X w/Heatsink'],
  'KINGSTON': ['NV2 PCIe 4.0', 'KC3000 PCIe 4.0', 'FURY RENEGADE', 'A400 SATA3', 'KC600 SATA3', 'NV3 PCIe 4.0'],
  'ADATA': ['LEGEND 900 PRO', 'LEGEND 850', 'LEGEND 710', 'XPG GAMMIX S70 BLADE', 'SU650 SATA3', 'SU800 SATA3'],
  'LEXAR': ['NM790 PCIe 4.0', 'NQ790 PCIe 4.0', 'NM620 PCIe 3.0', 'NS100 SATA3', 'NQ780 PCIe 4.0'],
  'CORSAIR': ['MP600 PRO LPX', 'MP600 ELITE', 'MP600 CORE XT', 'MP700 PCIe 5.0', 'FORCE MP510'],
  'CRUCIAL': ['P3 Plus PCIe 4.0', 'P5 Plus PCIe 4.0', 'T500 PCIe 4.0', 'T700 PCIe 5.0', 'BX500 SATA3', 'MX500 SATA3'],
  'SEAGATE': ['FIRECUDA 530', 'FIRECUDA 540 PCIe 5.0', 'BARRACUDA Q5', 'IRONWOLF 125', 'BARRACUDA 120'],
  'TEAMGROUP': ['MP44 PCIe 4.0', 'MP44L PCIe 4.0', 'T-FORCE CARDEA A440', 'CX2 SATA3', 'EX2 SATA3'],
  'KIOXIA': ['EXCERIA G2', 'EXCERIA PLUS G3', 'EXCERIA PRO', 'EXCERIA SATA3'],
  'TRANSCEND': ['MTE250S PCIe 4.0', 'MTE220S', 'SSD220S SATA3', 'ESD380C'],
  'GIGABYTE': ['AORUS Gen4 7300', 'AORUS Gen5 12000', 'GIGABYTE NVMe SSD', 'GIGABYTE 2.5" SATA'],
  'MSI': ['SPATIUM M480 PRO', 'SPATIUM M470', 'SPATIUM M371', 'SPATIUM S270 SATA'],
  'PATRIOT': ['VIPER VP4300 Lite', 'P300 M.2 PCIe', 'BURST ELITE SATA3', 'P210 SATA3']
};

const CAPACITIES = [256, 500, 512, 1000, 2000, 4000];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed200SSDs() {
  console.log('🔌 Connecting to MySQL database...');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [existing] = await conn.query('SELECT id, model FROM products WHERE category_id = 5');
  console.log(`📊 Current SSD count in DB: ${existing.length} items`);

  const targetCount = 200;
  const needed = targetCount - existing.length;

  if (needed <= 0) {
    console.log(`✅ DB already has ${existing.length} SSDs (>= 200). No more items needed.`);
    await conn.end();
    return;
  }

  console.log(`🚀 Adding ${needed} unique SSD items to reach 200 total...`);

  const existingModels = new Set(existing.map(e => e.model.toLowerCase()));
  let added = 0;
  let attempts = 0;

  while (added < needed && attempts < 1000) {
    attempts++;
    const brand = getRandomItem(BRANDS);
    const baseModel = getRandomItem(BRAND_MODELS[brand]);
    const capGb = getRandomItem(CAPACITIES);
    const capStr = capGb >= 1000 ? `${capGb / 1000}TB` : `${capGb}GB`;
    const formFactor = baseModel.includes('SATA') || baseModel.includes('2.5') || baseModel.includes('EVO 870') || baseModel.includes('A400') ? '2.5" SATA III' : 'NVMe M.2 PCIe 4.0';

    const fullModel = `${brand} ${baseModel} ${capStr} (${formFactor})`;

    if (existingModels.has(fullModel.toLowerCase())) {
      continue;
    }
    existingModels.add(fullModel.toLowerCase());

    // Realistic Speed & Price Calculations
    let readSpeed = 500;
    let writeSpeed = 450;
    let basePrice = 1290;

    if (formFactor.includes('NVMe')) {
      if (baseModel.includes('5.0') || baseModel.includes('12000') || baseModel.includes('T700')) {
        readSpeed = Math.floor(Math.random() * 2000) + 10000;
        writeSpeed = Math.floor(Math.random() * 2000) + 9000;
        basePrice = capGb >= 2000 ? 9990 : 5490;
      } else if (baseModel.includes('PRO') || baseModel.includes('SN850X') || baseModel.includes('KC3000') || baseModel.includes('790') || baseModel.includes('A440')) {
        readSpeed = Math.floor(Math.random() * 800) + 7000;
        writeSpeed = Math.floor(Math.random() * 800) + 6200;
        basePrice = capGb >= 2000 ? 6490 : (capGb >= 1000 ? 3490 : 1990);
      } else {
        readSpeed = Math.floor(Math.random() * 1500) + 3500;
        writeSpeed = Math.floor(Math.random() * 1000) + 2500;
        basePrice = capGb >= 2000 ? 4990 : (capGb >= 1000 ? 2590 : 1390);
      }
    } else {
      readSpeed = Math.floor(Math.random() * 60) + 500;
      writeSpeed = Math.floor(Math.random() * 60) + 450;
      basePrice = capGb >= 2000 ? 3890 : (capGb >= 1000 ? 2190 : 1090);
    }

    const price = Math.round(basePrice * (capGb / 500 > 1 ? (capGb / 500) * 0.85 : 1) / 10) * 10;
    const img = formFactor.includes('SATA') 
      ? 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products40588_800.jpg'
      : 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products123852_800.jpg';

    const specsJson = JSON.stringify({
      "Brand": brand,
      "Capacity": capStr,
      "Interface": formFactor,
      "Read Speed": `${readSpeed} MB/s`,
      "Write Speed": `${writeSpeed} MB/s`,
      "Form Factor": formFactor.includes('SATA') ? '2.5 inch' : 'M.2 2280'
    });

    const [res] = await conn.query(
      `INSERT INTO products (category_id, brand, model, price, image_url, stock_quantity, specifications)
       VALUES (5, ?, ?, ?, ?, 15, ?)`,
      [brand, fullModel, price, img, specsJson]
    );

    const pid = res.insertId;

    await conn.query(
      `INSERT INTO spec_storage (product_id, type, capacity_gb, read_speed_mbs, write_speed_mbs)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE type=VALUES(type), capacity_gb=VALUES(capacity_gb), read_speed_mbs=VALUES(read_speed_mbs), write_speed_mbs=VALUES(write_speed_mbs)`,
      [pid, formFactor, capGb, readSpeed, writeSpeed]
    );

    added++;
  }

  const [finalCount] = await conn.query('SELECT count(*) as total FROM products WHERE category_id = 5');
  console.log(`\n🎉 Done! Added ${added} SSD items. Total SSD count in DB is now: ${finalCount[0].total} items!`);

  await conn.end();
}

seed200SSDs().catch(err => {
  console.error('❌ Seeding error:', err);
  process.exit(1);
});
