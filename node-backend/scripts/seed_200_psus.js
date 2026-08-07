require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const BRANDS = ['CORSAIR', 'THERMALTAKE', 'SEASONIC', 'SILVERSTONE', 'ANTEC', 'BE QUIET!', 'COOLER MASTER', 'DEEPCOOL', 'MSI', 'GIGABYTE', 'ASUS'];

const BRAND_SERIES = {
  'CORSAIR': ['CV', 'CX-M', 'RM', 'RMe', 'RMx', 'HX', 'HXi', 'AX'],
  'THERMALTAKE': ['SMART BX1', 'SMART BM2', 'TOUGHPOWER GF1', 'TOUGHPOWER GF3', 'TOUGHPOWER PF3'],
  'SEASONIC': ['S12III', 'CORE GM', 'FOCUS GX', 'FOCUS PX', 'PRIME TX', 'PRIME PX'],
  'SILVERSTONE': ['VIVA', 'STRIDER', 'DECATHLON', 'HELA', 'NIGHTJAR'],
  'ANTEC': ['ATOM', 'CSK', 'NEOECO', 'SIGNATURE'],
  'BE QUIET!': ['SYSTEM POWER 10', 'PURE POWER 12 M', 'STRAIGHT POWER 12', 'DARK POWER 13'],
  'COOLER MASTER': ['ELITE V4', 'MWE BRONZE', 'MWE GOLD V2', 'V GOLD i', 'V PLATINUM'],
  'DEEPCOOL': ['PF', 'PK-D', 'PM-D', 'DQ-M-V2L', 'PX-G', 'PQ-M'],
  'MSI': ['MAG A550BN', 'MAG A650BN', 'MAG A750GL', 'MAG A850GL', 'MEG Ai1300P'],
  'GIGABYTE': ['P450B', 'P550B', 'P650B', 'UD750GM', 'UD850GM', 'UD1000GM'],
  'ASUS': ['TUF GAMING 650B', 'TUF GAMING 750G', 'ROG STRIX 850G', 'ROG THOR 1000P2', 'ROG THOR 1200P']
};

const WATTAGES = [500, 550, 600, 650, 700, 750, 850, 1000, 1200, 1300, 1600];
const RATINGS = ['80 Plus Bronze', '80 Plus Gold', '80 Plus Platinum', '80 Plus Titanium', '80 Plus Gold (ATX 3.0/PCIe 5.0)'];
const VARIANTS = ['', '(Black)', '(White Edition)', '(Full Modular)', '(Semi-Modular)', '(Gen5 Ready)'];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed200PSUs() {
  console.log('🔌 Connecting to MySQL database...');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [existing] = await conn.query('SELECT id, model FROM products WHERE category_id = 6');
  console.log(`📊 Current PSU count in DB: ${existing.length} items`);

  const targetCount = 200;
  const needed = targetCount - existing.length;

  if (needed <= 0) {
    console.log(`✅ DB already has ${existing.length} PSUs (>= 200). No more items needed.`);
    await conn.end();
    return;
  }

  console.log(`🚀 Adding ${needed} unique PSU items to reach 200 total...`);

  const existingModels = new Set(existing.map(e => e.model.toLowerCase()));
  let added = 0;
  let attempts = 0;

  while (added < needed && attempts < 2000) {
    attempts++;
    const brand = getRandomItem(BRANDS);
    const series = getRandomItem(BRAND_SERIES[brand]);
    const watt = getRandomItem(WATTAGES);
    const rating = watt >= 1000 ? (attempts % 2 === 0 ? '80 Plus Platinum' : '80 Plus Titanium') : getRandomItem(RATINGS);
    const variant = getRandomItem(VARIANTS);

    const fullModel = `${series} ${watt}W ${rating} ${variant}`.trim();
    const fullProductName = `${brand} ${fullModel}`;

    if (existingModels.has(fullProductName.toLowerCase()) || existingModels.has(fullModel.toLowerCase())) {
      continue;
    }
    existingModels.add(fullProductName.toLowerCase());

    // Price calculation
    let basePrice = watt * 4;
    if (rating.includes('Gold')) basePrice += 1200;
    if (rating.includes('Platinum')) basePrice += 2800;
    if (rating.includes('Titanium')) basePrice += 4500;
    if (rating.includes('ATX 3.0')) basePrice += 800;

    const price = Math.round(basePrice / 10) * 10;
    const img = 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products40588_800.jpg';

    const specsJson = JSON.stringify({
      "Brand": brand,
      "Wattage": `${watt}W`,
      "Efficiency": rating,
      "Modularity": variant.includes('Modular') ? variant : 'Full Modular',
      "Form Factor": 'ATX'
    });

    const [res] = await conn.query(
      `INSERT INTO products (category_id, brand, model, price, image_url, stock_quantity, specifications)
       VALUES (6, ?, ?, ?, ?, 10, ?)`,
      [brand, fullModel, price, img, specsJson]
    );

    const pid = res.insertId;

    await conn.query(
      `INSERT INTO spec_psu (product_id, wattage, efficiency_rating)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE wattage=VALUES(wattage), efficiency_rating=VALUES(efficiency_rating)`,
      [pid, watt, rating]
    );

    added++;
  }

  const [finalCount] = await conn.query('SELECT count(*) as total FROM products WHERE category_id = 6');
  console.log(`\n🎉 Done! Added ${added} PSU items. Total PSU count in DB is now: ${finalCount[0].total} items!`);

  await conn.end();
}

seed200PSUs().catch(err => {
  console.error('❌ PSU Seeding error:', err);
  process.exit(1);
});
