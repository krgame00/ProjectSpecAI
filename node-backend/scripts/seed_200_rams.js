require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const BRANDS = ['KINGSTON', 'CORSAIR', 'G.SKILL', 'TEAMGROUP', 'ADATA', 'CRUCIAL', 'PATRIOT', 'HIKSEMI', 'THERMALTAKE'];

const BRAND_SERIES = {
  'KINGSTON': ['FURY BEAST', 'FURY RENEGADE', 'FURY IMPACT', 'VALUERAM'],
  'CORSAIR': ['VENGEANCE LPX', 'VENGEANCE RGB', 'DOMINATOR PLATINUM', 'DOMINATOR TITANIUM'],
  'G.SKILL': ['TRIDENT Z RGB', 'TRIDENT Z5 NEO', 'TRIDENT Z5 RGB', 'RIPJAWS V', 'RIPJAWS S5', 'FLARE X5'],
  'TEAMGROUP': ['T-FORCE VULCAN Z', 'T-FORCE DELTA RGB', 'T-FORCE XTREEM', 'ELITE'],
  'ADATA': ['XPG SPECTRIX D50', 'XPG LANCER RGB', 'XPG CASTER', 'PREMIER'],
  'CRUCIAL': ['PRO OVERCLOCKING', 'PRO GAMING', 'BASICS'],
  'PATRIOT': ['VIPER STEEL', 'VIPER VENOM', 'VIPER ELITE'],
  'HIKSEMI': ['ARMOR', 'HIKVISION U10'],
  'THERMALTAKE': ['TOUGHRAM XG RGB', 'TOUGHRAM RC']
};

const DDR4_CAPACITIES = [8, 16, 32, 64];
const DDR4_SPEEDS = [2666, 3200, 3600];

const DDR5_CAPACITIES = [16, 32, 48, 64, 96];
const DDR5_SPEEDS = [4800, 5200, 5600, 6000, 6400, 7200, 8000];

const COLORS = ['BLACK', 'WHITE', 'RGB (BLACK)', 'RGB (WHITE)'];
const PACKS = ['(8GBx1)', '(8GBx2)', '(16GBx1)', '(16GBx2)', '(32GBx2)'];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed200RAMs() {
  console.log('🔌 Connecting to MySQL database...');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [existing] = await conn.query('SELECT id, model FROM products WHERE category_id = 3');
  console.log(`📊 Current RAM count in DB: ${existing.length} items`);

  const targetCount = 200;
  const needed = targetCount - existing.length;

  if (needed <= 0) {
    console.log(`✅ DB already has ${existing.length} RAMs (>= 200). No more items needed.`);
    await conn.end();
    return;
  }

  console.log(`🚀 Adding ${needed} unique RAM items to reach 200 total...`);

  const existingModels = new Set(existing.map(e => e.model.toLowerCase()));
  let added = 0;
  let attempts = 0;

  while (added < needed && attempts < 2000) {
    attempts++;
    const brand = getRandomItem(BRANDS);
    const series = getRandomItem(BRAND_SERIES[brand]);
    const ramType = attempts % 2 === 0 ? 'DDR4' : 'DDR5';
    
    const capGb = ramType === 'DDR4' ? getRandomItem(DDR4_CAPACITIES) : getRandomItem(DDR5_CAPACITIES);
    const busSpeed = ramType === 'DDR4' ? getRandomItem(DDR4_SPEEDS) : getRandomItem(DDR5_SPEEDS);
    const color = getRandomItem(COLORS);
    const pack = getRandomItem(PACKS);

    const fullModel = `${series} ${ramType} ${capGb}GB (${capGb/2}GBx2) ${busSpeed}MHz ${color}`;
    const fullProductName = `${brand} ${fullModel}`;

    if (existingModels.has(fullProductName.toLowerCase()) || existingModels.has(fullModel.toLowerCase())) {
      continue;
    }
    existingModels.add(fullProductName.toLowerCase());

    // Price logic
    let baseP = ramType === 'DDR4' ? (capGb * 90) : (capGb * 140);
    if (busSpeed > 6000) baseP += 800;
    if (color.includes('RGB')) baseP += 300;

    const price = Math.round(baseP / 10) * 10;
    const img = 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products40588_800.jpg';

    const specsJson = JSON.stringify({
      "Brand": brand,
      "Memory Type": ramType,
      "Capacity": `${capGb}GB`,
      "Bus Speed": `${busSpeed}MHz`,
      "Color": color,
      "Latency": ramType === 'DDR4' ? 'CL16' : 'CL30'
    });

    const [res] = await conn.query(
      `INSERT INTO products (category_id, brand, model, price, image_url, stock_quantity, specifications)
       VALUES (3, ?, ?, ?, ?, 10, ?)`,
      [brand, fullModel, price, img, specsJson]
    );

    const pid = res.insertId;

    await conn.query(
      `INSERT INTO spec_ram (product_id, ram_type, capacity_gb, bus_speed)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE ram_type=VALUES(ram_type), capacity_gb=VALUES(capacity_gb), bus_speed=VALUES(bus_speed)`,
      [pid, ramType, capGb, busSpeed]
    );

    added++;
  }

  const [finalCount] = await conn.query('SELECT count(*) as total FROM products WHERE category_id = 3');
  console.log(`\n🎉 Done! Added ${added} RAM items. Total RAM count in DB is now: ${finalCount[0].total} items!`);

  await conn.end();
}

seed200RAMs().catch(err => {
  console.error('❌ RAM Seeding error:', err);
  process.exit(1);
});
