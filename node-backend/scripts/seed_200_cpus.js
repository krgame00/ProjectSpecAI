require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const INTEL_MODELS = [
  // 14th Gen
  { model: 'Core i9-14900KS', socket: 'LGA1700', cores: 24, threads: 32, tdp: 150, price: 24900 },
  { model: 'Core i9-14900K', socket: 'LGA1700', cores: 24, threads: 32, tdp: 125, price: 22500 },
  { model: 'Core i9-14900KF', socket: 'LGA1700', cores: 24, threads: 32, tdp: 125, price: 21500 },
  { model: 'Core i9-14900F', socket: 'LGA1700', cores: 24, threads: 32, tdp: 65, price: 19900 },
  { model: 'Core i9-14900', socket: 'LGA1700', cores: 24, threads: 32, tdp: 65, price: 20500 },
  { model: 'Core i7-14700K', socket: 'LGA1700', cores: 20, threads: 28, tdp: 125, price: 15900 },
  { model: 'Core i7-14700KF', socket: 'LGA1700', cores: 20, threads: 28, tdp: 125, price: 14900 },
  { model: 'Core i7-14700F', socket: 'LGA1700', cores: 20, threads: 28, tdp: 65, price: 13500 },
  { model: 'Core i7-14700', socket: 'LGA1700', cores: 20, threads: 28, tdp: 65, price: 13900 },
  { model: 'Core i5-14600K', socket: 'LGA1700', cores: 14, threads: 20, tdp: 125, price: 11900 },
  { model: 'Core i5-14600KF', socket: 'LGA1700', cores: 14, threads: 20, tdp: 125, price: 10900 },
  { model: 'Core i5-14500', socket: 'LGA1700', cores: 14, threads: 20, tdp: 65, price: 9200 },
  { model: 'Core i5-14400F', socket: 'LGA1700', cores: 10, threads: 16, tdp: 65, price: 7490 },
  { model: 'Core i5-14400', socket: 'LGA1700', cores: 10, threads: 16, tdp: 65, price: 7990 },
  { model: 'Core i3-14100F', socket: 'LGA1700', cores: 4, threads: 8, tdp: 58, price: 3990 },
  { model: 'Core i3-14100', socket: 'LGA1700', cores: 4, threads: 8, tdp: 60, price: 4790 },

  // Core Ultra (Series 2 / Arrow Lake)
  { model: 'Core Ultra 9 285K', socket: 'LGA1851', cores: 24, threads: 24, tdp: 125, price: 23900 },
  { model: 'Core Ultra 7 265K', socket: 'LGA1851', cores: 20, threads: 20, tdp: 125, price: 16500 },
  { model: 'Core Ultra 7 265KF', socket: 'LGA1851', cores: 20, threads: 20, tdp: 125, price: 15500 },
  { model: 'Core Ultra 5 245K', socket: 'LGA1851', cores: 14, threads: 14, tdp: 125, price: 11900 },
  { model: 'Core Ultra 5 245KF', socket: 'LGA1851', cores: 14, threads: 14, tdp: 125, price: 10900 },

  // 13th Gen
  { model: 'Core i9-13900KS', socket: 'LGA1700', cores: 24, threads: 32, tdp: 150, price: 23900 },
  { model: 'Core i9-13900K', socket: 'LGA1700', cores: 24, threads: 32, tdp: 125, price: 20900 },
  { model: 'Core i9-13900KF', socket: 'LGA1700', cores: 24, threads: 32, tdp: 125, price: 19900 },
  { model: 'Core i9-13900F', socket: 'LGA1700', cores: 24, threads: 32, tdp: 65, price: 18500 },
  { model: 'Core i7-13700K', socket: 'LGA1700', cores: 16, threads: 24, tdp: 125, price: 14500 },
  { model: 'Core i7-13700KF', socket: 'LGA1700', cores: 16, threads: 24, tdp: 125, price: 13500 },
  { model: 'Core i7-13700F', socket: 'LGA1700', cores: 16, threads: 24, tdp: 65, price: 12500 },
  { model: 'Core i5-13600K', socket: 'LGA1700', cores: 14, threads: 20, tdp: 125, price: 10500 },
  { model: 'Core i5-13600KF', socket: 'LGA1700', cores: 14, threads: 20, tdp: 125, price: 9500 },
  { model: 'Core i5-13500', socket: 'LGA1700', cores: 14, threads: 20, tdp: 65, price: 8490 },
  { model: 'Core i5-13400F', socket: 'LGA1700', cores: 10, threads: 16, tdp: 65, price: 6590 },
  { model: 'Core i5-13400', socket: 'LGA1700', cores: 10, threads: 16, tdp: 65, price: 7190 },
  { model: 'Core i3-13100F', socket: 'LGA1700', cores: 4, threads: 8, tdp: 58, price: 3490 },
  { model: 'Core i3-13100', socket: 'LGA1700', cores: 4, threads: 8, tdp: 60, price: 4290 },

  // 12th Gen
  { model: 'Core i9-12900K', socket: 'LGA1700', cores: 16, threads: 24, tdp: 125, price: 16900 },
  { model: 'Core i9-12900KF', socket: 'LGA1700', cores: 16, threads: 24, tdp: 125, price: 15900 },
  { model: 'Core i7-12700K', socket: 'LGA1700', cores: 12, threads: 20, tdp: 125, price: 11900 },
  { model: 'Core i7-12700KF', socket: 'LGA1700', cores: 12, threads: 20, tdp: 125, price: 10900 },
  { model: 'Core i7-12700F', socket: 'LGA1700', cores: 12, threads: 20, tdp: 65, price: 9900 },
  { model: 'Core i5-12600K', socket: 'LGA1700', cores: 10, threads: 16, tdp: 125, price: 8290 },
  { model: 'Core i5-12600KF', socket: 'LGA1700', cores: 10, threads: 16, tdp: 125, price: 7490 },
  { model: 'Core i5-12400F', socket: 'LGA1700', cores: 6, threads: 12, tdp: 65, price: 4590 },
  { model: 'Core i5-12400', socket: 'LGA1700', cores: 6, threads: 12, tdp: 65, price: 5290 },
  { model: 'Core i3-12100F', socket: 'LGA1700', cores: 4, threads: 8, tdp: 58, price: 2990 },
  { model: 'Core i3-12100', socket: 'LGA1700', cores: 4, threads: 8, tdp: 60, price: 3690 }
];

const AMD_MODELS = [
  // Ryzen 9000 Series (Zen 5)
  { model: 'Ryzen 9 9950X3D', socket: 'AM5', cores: 16, threads: 32, tdp: 170, price: 25900 },
  { model: 'Ryzen 9 9950X', socket: 'AM5', cores: 16, threads: 32, tdp: 170, price: 23900 },
  { model: 'Ryzen 9 9900X3D', socket: 'AM5', cores: 12, threads: 24, tdp: 120, price: 21900 },
  { model: 'Ryzen 9 9900X', socket: 'AM5', cores: 12, threads: 24, tdp: 120, price: 18900 },
  { model: 'Ryzen 7 9800X3D', socket: 'AM5', cores: 8, threads: 16, tdp: 120, price: 17900 },
  { model: 'Ryzen 7 9700X', socket: 'AM5', cores: 8, threads: 16, tdp: 65, price: 13900 },
  { model: 'Ryzen 5 9600X', socket: 'AM5', cores: 6, threads: 12, tdp: 65, price: 9900 },

  // Ryzen 8000G Series (APU)
  { model: 'Ryzen 7 8700G', socket: 'AM5', cores: 8, threads: 16, tdp: 65, price: 11900 },
  { model: 'Ryzen 5 8600G', socket: 'AM5', cores: 6, threads: 12, tdp: 65, price: 8290 },
  { model: 'Ryzen 5 8500G', socket: 'AM5', cores: 6, threads: 12, tdp: 65, price: 6290 },
  { model: 'Ryzen 3 8300G', socket: 'AM5', cores: 4, threads: 8, tdp: 65, price: 3990 },

  // Ryzen 7000 Series (Zen 4)
  { model: 'Ryzen 9 7950X3D', socket: 'AM5', cores: 16, threads: 32, tdp: 120, price: 22900 },
  { model: 'Ryzen 9 7950X', socket: 'AM5', cores: 16, threads: 32, tdp: 170, price: 19900 },
  { model: 'Ryzen 9 7900X3D', socket: 'AM5', cores: 12, threads: 24, tdp: 120, price: 17900 },
  { model: 'Ryzen 9 7900X', socket: 'AM5', cores: 12, threads: 24, tdp: 170, price: 14900 },
  { model: 'Ryzen 9 7900', socket: 'AM5', cores: 12, threads: 24, tdp: 65, price: 13900 },
  { model: 'Ryzen 7 7800X3D', socket: 'AM5', cores: 8, threads: 16, tdp: 120, price: 14900 },
  { model: 'Ryzen 7 7700X', socket: 'AM5', cores: 8, threads: 16, tdp: 105, price: 11900 },
  { model: 'Ryzen 7 7700', socket: 'AM5', cores: 8, threads: 16, tdp: 65, price: 10500 },
  { model: 'Ryzen 5 7600X', socket: 'AM5', cores: 6, threads: 12, tdp: 105, price: 7890 },
  { model: 'Ryzen 5 7600', socket: 'AM5', cores: 6, threads: 12, tdp: 65, price: 7190 },
  { model: 'Ryzen 5 7500F', socket: 'AM5', cores: 6, threads: 12, tdp: 65, price: 5690 },

  // Ryzen 5000 Series (AM4)
  { model: 'Ryzen 9 5950X', socket: 'AM4', cores: 16, threads: 32, tdp: 105, price: 14900 },
  { model: 'Ryzen 9 5900X', socket: 'AM4', cores: 12, threads: 24, tdp: 105, price: 10900 },
  { model: 'Ryzen 7 5800X3D', socket: 'AM4', cores: 8, threads: 16, tdp: 105, price: 11500 },
  { model: 'Ryzen 7 5700X3D', socket: 'AM4', cores: 8, threads: 16, tdp: 105, price: 8590 },
  { model: 'Ryzen 7 5800X', socket: 'AM4', cores: 8, threads: 16, tdp: 105, price: 7490 },
  { model: 'Ryzen 7 5700X', socket: 'AM4', cores: 8, threads: 16, tdp: 65, price: 6290 },
  { model: 'Ryzen 7 5700G', socket: 'AM4', cores: 8, threads: 16, tdp: 65, price: 6590 },
  { model: 'Ryzen 5 5600X', socket: 'AM4', cores: 6, threads: 12, tdp: 65, price: 5190 },
  { model: 'Ryzen 5 5600', socket: 'AM4', cores: 6, threads: 12, tdp: 65, price: 4290 },
  { model: 'Ryzen 5 5600G', socket: 'AM4', cores: 6, threads: 12, tdp: 65, price: 4490 },
  { model: 'Ryzen 5 5500', socket: 'AM4', cores: 6, threads: 12, tdp: 65, price: 3290 },
  { model: 'Ryzen 5 5500GT', socket: 'AM4', cores: 6, threads: 12, tdp: 65, price: 3790 },
  { model: 'Ryzen 3 4100', socket: 'AM4', cores: 4, threads: 8, tdp: 65, price: 2390 },
  { model: 'Ryzen 5 4600G', socket: 'AM4', cores: 6, threads: 12, tdp: 65, price: 3490 }
];

const VARIANTS = ['', '(BOX)', '(MPK)', '(Tray)', '(Synnex)', '(WTG)', '(Ingram)', '(S-Trek)', '(WPG)'];

async function seed200CPUs() {
  console.log('🔌 Connecting to MySQL database...');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [existing] = await conn.query('SELECT id, model FROM products WHERE category_id = 1');
  console.log(`📊 Current CPU count in DB: ${existing.length} items`);

  const targetCount = 200;
  const needed = targetCount - existing.length;

  if (needed <= 0) {
    console.log(`✅ DB already has ${existing.length} CPUs (>= 200). No more items needed.`);
    await conn.end();
    return;
  }

  console.log(`🚀 Adding ${needed} unique CPU items to reach 200 total...`);

  const existingModels = new Set(existing.map(e => e.model.toLowerCase()));
  let added = 0;
  let attempts = 0;

  const pool = [];
  INTEL_MODELS.forEach(m => pool.push({ brand: 'Intel', ...m }));
  AMD_MODELS.forEach(m => pool.push({ brand: 'AMD', ...m }));

  while (added < needed && attempts < 2000) {
    attempts++;
    const base = pool[attempts % pool.length];
    const variant = VARIANTS[Math.floor(attempts / pool.length) % VARIANTS.length];
    const fullModel = `${base.model} ${variant}`.trim();

    if (existingModels.has(fullModel.toLowerCase())) {
      continue;
    }
    existingModels.add(fullModel.toLowerCase());

    const price = Math.round((base.price + (Math.floor(Math.random() * 5) - 2) * 100) / 10) * 10;
    const img = base.brand === 'Intel'
      ? 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/product1048_800.jpg'
      : 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products40588_800.jpg';

    const specsJson = JSON.stringify({
      "Brand": base.brand,
      "CPU Socket": base.socket,
      "Cores": `${base.cores}`,
      "Threads": `${base.threads}`,
      "TDP": `${base.tdp}W`,
      "Architecture": base.brand === 'Intel' ? 'x86-64' : 'Zen'
    });

    const [res] = await conn.query(
      `INSERT INTO products (category_id, brand, model, price, image_url, stock_quantity, specifications)
       VALUES (1, ?, ?, ?, ?, 10, ?)`,
      [base.brand, fullModel, price, img, specsJson]
    );

    const pid = res.insertId;

    await conn.query(
      `INSERT INTO spec_cpu (product_id, socket, cores, threads, tdp_watt)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE socket=VALUES(socket), cores=VALUES(cores), threads=VALUES(threads), tdp_watt=VALUES(tdp_watt)`,
      [pid, base.socket, base.cores, base.threads, base.tdp]
    );

    added++;
  }

  const [finalCount] = await conn.query('SELECT count(*) as total FROM products WHERE category_id = 1');
  console.log(`\n🎉 Done! Added ${added} CPU items. Total CPU count in DB is now: ${finalCount[0].total} items!`);

  await conn.end();
}

seed200CPUs().catch(err => {
  console.error('❌ CPU Seeding error:', err);
  process.exit(1);
});
