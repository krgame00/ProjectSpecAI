require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const BRANDS = ['NZXT', 'LIAN LI', 'CORSAIR', 'MONTECH', 'AEROCOOL', 'HYTE', 'DEEPCOOL', 'THERMALTAKE', 'ANTEC', 'COOLER MASTER', 'ASUS', 'iHAVECPU'];

const BRAND_SERIES = {
  'NZXT': ['H5 FLOW', 'H6 FLOW', 'H7 FLOW', 'H9 FLOW', 'H9 ELITE', 'H1 V2'],
  'LIAN LI': ['O11 DYNAMIC EVO', 'O11 VISION', 'LANCOOL 216', 'LANCOOL III', 'DAN A4-H2O', 'O11 AIR MINI'],
  'CORSAIR': ['3000D AIRFLOW', '4000D AIRFLOW', '5000D AIRFLOW', '6500X DUAL CHAMBER', '2500X MICRO'],
  'MONTECH': ['AIR 100 ARGB', 'AIR 903 MAX', 'SKY TWO', 'KING 95 PRO', 'HERA 360'],
  'AEROCOOL': ['CYLON RGB', 'AERO ONE FROST', 'SKRIB RGB', 'DRYFT ARGB'],
  'HYTE': ['Y40', 'Y60 TOUCH', 'Y70 TOUCH', 'Y70 TI'],
  'DEEPCOOL': ['CC560 ARGB', 'CH560 DIGITAL', 'CH370', 'MORPHEUS', 'MATREXX 55 V3'],
  'THERMALTAKE': ['VIEW 270 TG ARGB', 'THE TOWER 300', 'THE TOWER 500', 'CERES 300 TG', 'CORE P3 TG'],
  'ANTEC': ['C5 ARGB', 'C8 DUAL CHAMBER', 'PERFORMANCE 1 FT', 'AX90 ARGB', 'NX200M'],
  'COOLER MASTER': ['MASTERBOX Q300L', 'TD500 MESH V2', 'HAF 700 EVO', 'CMP 510'],
  'ASUS': ['TUF GAMING GT302 ARGB', 'ROG STRIX HELIOS', 'ROG HYPERION GR701', 'PRIME AP201'],
  'iHAVECPU': ['IHC 102 WOOD', 'PRISMA ARGB', 'GLACIER V2', 'G390 V2', 'IHC R03', 'IHC 401TG', 'OA01']
};

const FORM_FACTORS = ['ATX, Micro-ATX', 'Micro-ATX, Mini-ITX', 'E-ATX, ATX, Micro-ATX', 'Mini-ITX'];
const COLORS = ['BLACK', 'WHITE', 'PANORAMA GLASS (BLACK)', 'PANORAMA GLASS (WHITE)', 'WOOD EDITION'];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed200Cases() {
  console.log('🔌 Connecting to MySQL database...');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [existing] = await conn.query('SELECT id, model FROM products WHERE category_id = 7');
  console.log(`📊 Current Case count in DB: ${existing.length} items`);

  const targetCount = 200;
  const needed = targetCount - existing.length;

  if (needed <= 0) {
    console.log(`✅ DB already has ${existing.length} Cases (>= 200). No more items needed.`);
    await conn.end();
    return;
  }

  console.log(`🚀 Adding ${needed} unique Case items to reach 200 total...`);

  const existingModels = new Set(existing.map(e => e.model.toLowerCase()));
  let added = 0;
  let attempts = 0;

  while (added < needed && attempts < 2000) {
    attempts++;
    const brand = getRandomItem(BRANDS);
    const series = getRandomItem(BRAND_SERIES[brand]);
    const ff = getRandomItem(FORM_FACTORS);
    const color = getRandomItem(COLORS);
    const maxGpuLength = Math.floor(Math.random() * 12) * 10 + 320; // 320mm to 430mm

    const fullModel = `${series} (${color}) (V.${(attempts % 3) + 1})`;
    const fullProductName = `${brand} ${fullModel}`;

    if (existingModels.has(fullProductName.toLowerCase()) || existingModels.has(fullModel.toLowerCase())) {
      continue;
    }
    existingModels.add(fullProductName.toLowerCase());

    // Price calculation
    let basePrice = 1490;
    if (series.includes('HYTE') || series.includes('O11') || series.includes('H9') || series.includes('HYPERION') || series.includes('HELIOS')) basePrice += 4500;
    if (color.includes('PANORAMA') || color.includes('WOOD')) basePrice += 1200;

    const price = Math.round(basePrice / 10) * 10;
    const img = 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products40588_800.jpg';

    const specsJson = JSON.stringify({
      "Brand": brand,
      "Form Factor Support": ff,
      "Max GPU Length": `${maxGpuLength}mm`,
      "Color": color,
      "Side Panel": 'Tempered Glass'
    });

    const [res] = await conn.query(
      `INSERT INTO products (category_id, brand, model, price, image_url, stock_quantity, specifications)
       VALUES (7, ?, ?, ?, ?, 10, ?)`,
      [brand, fullModel, price, img, specsJson]
    );

    const pid = res.insertId;

    await conn.query(
      `INSERT INTO spec_case (product_id, form_factor_support, max_gpu_length_mm)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE form_factor_support=VALUES(form_factor_support), max_gpu_length_mm=VALUES(max_gpu_length_mm)`,
      [pid, ff, maxGpuLength]
    );

    added++;
  }

  const [finalCount] = await conn.query('SELECT count(*) as total FROM products WHERE category_id = 7');
  console.log(`\n🎉 Done! Added ${added} Case items. Total Case count in DB is now: ${finalCount[0].total} items!`);

  await conn.end();
}

seed200Cases().catch(err => {
  console.error('❌ Case Seeding error:', err);
  process.exit(1);
});
