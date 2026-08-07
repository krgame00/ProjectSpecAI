require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const GPU_MODELS = [
  // NVIDIA RTX 50 Series
  { brand: 'ASUS', model: 'ROG STRIX RTX 5090 O32G GAMING', chipset: 'NVIDIA GeForce RTX 5090', vram: 32, tdp: 600, length: 358, price: 89900 },
  { brand: 'TUF', model: 'TUF GAMING RTX 5090 32G', chipset: 'NVIDIA GeForce RTX 5090', vram: 32, tdp: 600, length: 348, price: 83900 },
  { brand: 'GIGABYTE', model: 'AORUS RTX 5090 XTREME WATERFORCE 32G', chipset: 'NVIDIA GeForce RTX 5090', vram: 32, tdp: 600, length: 300, price: 92900 },
  { brand: 'MSI', model: 'SUPRIM SOC RTX 5090 32G', chipset: 'NVIDIA GeForce RTX 5090', vram: 32, tdp: 600, length: 355, price: 88900 },
  { brand: 'ASUS', model: 'ROG STRIX RTX 5080 O16G GAMING', chipset: 'NVIDIA GeForce RTX 5080', vram: 16, tdp: 400, length: 340, price: 47900 },
  { brand: 'GIGABYTE', model: 'GAMING OC RTX 5080 16G', chipset: 'NVIDIA GeForce RTX 5080', vram: 16, tdp: 400, length: 330, price: 43900 },
  { brand: 'MSI', model: 'VENTUS 3X RTX 5080 16G OC', chipset: 'NVIDIA GeForce RTX 5080', vram: 16, tdp: 400, length: 322, price: 42900 },
  { brand: 'GALAX', model: 'SG 1-Click OC RTX 5080 16G', chipset: 'NVIDIA GeForce RTX 5080', vram: 16, tdp: 400, length: 336, price: 41900 },
  { brand: 'ZOTAC', model: 'GAMING RTX 5080 AMP EXTREME AIRO', chipset: 'NVIDIA GeForce RTX 5080', vram: 16, tdp: 400, length: 345, price: 42500 },

  // NVIDIA RTX 40 Super & Standard Series
  { brand: 'ASUS', model: 'ROG STRIX RTX 4080 SUPER 16GB OC', chipset: 'NVIDIA GeForce RTX 4080 SUPER', vram: 16, tdp: 320, length: 357, price: 44900 },
  { brand: 'GIGABYTE', model: 'AERO OC RTX 4080 SUPER 16G', chipset: 'NVIDIA GeForce RTX 4080 SUPER', vram: 16, tdp: 320, length: 342, price: 42900 },
  { brand: 'MSI', model: 'GAMING X SLIM RTX 4080 SUPER 16G', chipset: 'NVIDIA GeForce RTX 4080 SUPER', vram: 16, tdp: 320, length: 322, price: 41900 },
  { brand: 'ASUS', model: 'TUF GAMING RTX 4070 Ti SUPER 16GB', chipset: 'NVIDIA GeForce RTX 4070 Ti SUPER', vram: 16, tdp: 285, length: 305, price: 33900 },
  { brand: 'GIGABYTE', model: 'GAMING OC RTX 4070 Ti SUPER 16G', chipset: 'NVIDIA GeForce RTX 4070 Ti SUPER', vram: 16, tdp: 285, length: 300, price: 32900 },
  { brand: 'MSI', model: 'VENTUS 2X RTX 4070 Ti SUPER 16G OC', chipset: 'NVIDIA GeForce RTX 4070 Ti SUPER', vram: 16, tdp: 285, length: 242, price: 31900 },
  { brand: 'ZOTAC', model: 'GAMING RTX 4070 SUPER TWIN EDGE 12G', chipset: 'NVIDIA GeForce RTX 4070 SUPER', vram: 12, tdp: 220, length: 225, price: 23900 },
  { brand: 'GALAX', model: 'EX GAMER RTX 4070 SUPER 12GB', chipset: 'NVIDIA GeForce RTX 4070 SUPER', vram: 12, tdp: 220, length: 323, price: 24500 },
  { brand: 'INNO3D', model: 'GEFORCE RTX 4070 SUPER TWIN X2 12G', chipset: 'NVIDIA GeForce RTX 4070 SUPER', vram: 12, tdp: 220, length: 250, price: 22900 },
  { brand: 'ASUS', model: 'DUAL RTX 4060 Ti 16GB OC', chipset: 'NVIDIA GeForce RTX 4060 Ti', vram: 16, tdp: 165, length: 227, price: 17900 },
  { brand: 'MSI', model: 'VENTUS 2X RTX 4060 Ti 8GB OC', chipset: 'NVIDIA GeForce RTX 4060 Ti', vram: 8, tdp: 160, length: 199, price: 14500 },
  { brand: 'GIGABYTE', model: 'EAGLE OC RTX 4060 Ti 8G', chipset: 'NVIDIA GeForce RTX 4060 Ti', vram: 8, tdp: 160, length: 272, price: 14900 },
  { brand: 'PALIT', model: 'GEFORCE RTX 4060 DUAL 8GB', chipset: 'NVIDIA GeForce RTX 4060', vram: 8, tdp: 115, length: 249, price: 10200 },
  { brand: 'ZOTAC', model: 'GAMING RTX 4060 SOLO 8GB', chipset: 'NVIDIA GeForce RTX 4060', vram: 8, tdp: 115, length: 163, price: 9900 },
  { brand: 'COLORFUL', model: 'BATTLE-AX RTX 4060 NB DUO 8GB-V', chipset: 'NVIDIA GeForce RTX 4060', vram: 8, tdp: 115, length: 249, price: 9800 },
  { brand: 'ASUS', model: 'DUAL RTX 3050 6GB OC', chipset: 'NVIDIA GeForce RTX 3050', vram: 6, tdp: 70, length: 201, price: 6290 },

  // AMD Radeon RX 7000 Series
  { brand: 'SAPPHIRE', model: 'NITRO+ RX 7900 XTX 24GB VAPOR-X', chipset: 'AMD Radeon RX 7900 XTX', vram: 24, tdp: 355, length: 320, price: 39900 },
  { brand: 'POWERCOLOR', model: 'RED DEVIL RX 7900 XTX 24GB', chipset: 'AMD Radeon RX 7900 XTX', vram: 24, tdp: 355, length: 338, price: 38900 },
  { brand: 'ASROCK', model: 'PHANTOM GAMING RX 7900 XT 20GB OC', chipset: 'AMD Radeon RX 7900 XT', vram: 20, tdp: 315, length: 330, price: 29900 },
  { brand: 'SAPPHIRE', model: 'PULSE RX 7900 GRE 16GB', chipset: 'AMD Radeon RX 7900 GRE', vram: 16, tdp: 260, length: 280, price: 21900 },
  { brand: 'POWERCOLOR', model: 'HELLHOUND RX 7800 XT 16GB', chipset: 'AMD Radeon RX 7800 XT', vram: 16, tdp: 263, length: 322, price: 18900 },
  { brand: 'GIGABYTE', model: 'GAMING OC RX 7700 XT 12G', chipset: 'AMD Radeon RX 7700 XT', vram: 12, tdp: 245, length: 301, price: 16200 },
  { brand: 'SAPPHIRE', model: 'PULSE RX 7600 XT 16GB', chipset: 'AMD Radeon RX 7600 XT', vram: 16, tdp: 190, length: 240, price: 12900 },
  { brand: 'ASROCK', model: 'CHALLENGER RX 7600 8GB OC', chipset: 'AMD Radeon RX 7600', vram: 8, tdp: 165, length: 269, price: 8900 },

  // Intel Arc Series
  { brand: 'SPARKLE', model: 'INTEL ARC B580 ORC OC 12GB', chipset: 'Intel Arc B580', vram: 12, tdp: 190, length: 222, price: 9590 },
  { brand: 'ASROCK', model: 'INTEL ARC B580 STEEL LEGEND 12GB OC', chipset: 'Intel Arc B580', vram: 12, tdp: 190, length: 278, price: 9990 },
  { brand: 'GUNNIR', model: 'INTEL ARC A770 PHOTON 16GB OC', chipset: 'Intel Arc A770', vram: 16, tdp: 225, length: 300, price: 11900 },
  { brand: 'SPARKLE', model: 'INTEL ARC A750 TITAN OC 8GB', chipset: 'Intel Arc A750', vram: 8, tdp: 225, length: 305, price: 7990 }
];

const VARIANTS = ['', '(Box)', '(V2)', '(LHR)', '(White Edition)', '(OC)', '(Synnex)', '(WTG)', '(S-Trek)'];

async function seed200GPUs() {
  console.log('🔌 Connecting to MySQL database...');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [existing] = await conn.query('SELECT id, model FROM products WHERE category_id = 4');
  console.log(`📊 Current GPU count in DB: ${existing.length} items`);

  const targetCount = 200;
  const needed = targetCount - existing.length;

  if (needed <= 0) {
    console.log(`✅ DB already has ${existing.length} GPUs (>= 200). No more items needed.`);
    await conn.end();
    return;
  }

  console.log(`🚀 Adding ${needed} unique GPU items to reach 200 total...`);

  const existingModels = new Set(existing.map(e => e.model.toLowerCase()));
  let added = 0;
  let attempts = 0;

  while (added < needed && attempts < 2000) {
    attempts++;
    const base = GPU_MODELS[attempts % GPU_MODELS.length];
    const variant = VARIANTS[Math.floor(attempts / GPU_MODELS.length) % VARIANTS.length];
    const fullModel = `${base.model} ${variant}`.trim();
    const fullProductName = `${base.brand} ${fullModel}`;

    if (existingModels.has(fullProductName.toLowerCase()) || existingModels.has(fullModel.toLowerCase())) {
      continue;
    }
    existingModels.add(fullProductName.toLowerCase());

    const price = Math.round((base.price + (Math.floor(Math.random() * 5) - 2) * 200) / 10) * 10;
    const img = 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products40588_800.jpg';

    const specsJson = JSON.stringify({
      "Brand": base.brand,
      "Chipset": base.chipset,
      "Memory Size": `${base.vram}GB`,
      "TDP": `${base.tdp}W`,
      "Length (mm)": `${base.length}mm`,
      "Power Requirement": `${Math.ceil(base.tdp * 1.5 + 200)}W`
    });

    const [res] = await conn.query(
      `INSERT INTO products (category_id, brand, model, price, image_url, stock_quantity, specifications)
       VALUES (4, ?, ?, ?, ?, 10, ?)`,
      [base.brand, fullModel, price, img, specsJson]
    );

    const pid = res.insertId;

    await conn.query(
      `INSERT INTO spec_gpu (product_id, chipset, vram_gb, tdp_watt, length_mm)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE chipset=VALUES(chipset), vram_gb=VALUES(vram_gb), tdp_watt=VALUES(tdp_watt), length_mm=VALUES(length_mm)`,
      [pid, base.chipset, base.vram, base.tdp, base.length]
    );

    added++;
  }

  const [finalCount] = await conn.query('SELECT count(*) as total FROM products WHERE category_id = 4');
  console.log(`\n🎉 Done! Added ${added} GPU items. Total GPU count in DB is now: ${finalCount[0].total} items!`);

  await conn.end();
}

seed200GPUs().catch(err => {
  console.error('❌ GPU Seeding error:', err);
  process.exit(1);
});
