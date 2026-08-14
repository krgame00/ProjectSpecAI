require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function findPrice2490Items() {
  console.log('================================================================');
  console.log('🔍 SCANNING FOR ฿2,490 PLACEHOLDER PRICES ACROSS ALL CATEGORIES');
  console.log('================================================================\n');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [items2490] = await connection.query(`
    SELECT p.id, p.category_id, c.slug as category_slug, p.brand, p.model, p.price, p.image_url
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.price = 2490.00
    ORDER BY p.category_id ASC, p.id ASC
  `);

  console.log(`Total products with price ฿2,490.00: ${items2490.length}\n`);
  items2490.forEach(item => {
    console.log(`[${item.id}] (${item.category_slug}) "${item.brand} ${item.model}" | Image: ${item.image_url}`);
  });

  // Also inspect GPU pricing and TDP across all GPUs
  console.log('\n=== ALL GPU PRICES & CHIPSET TIERS ===');
  const [gpus] = await connection.query(`
    SELECT p.id, p.brand, p.model, p.price, g.chipset, g.vram_gb, g.tdp_watt, g.length_mm
    FROM products p
    JOIN spec_gpu g ON p.id = g.product_id
    WHERE p.category_id = 4
    ORDER BY p.price ASC
  `);

  const suspiciousGpus = gpus.filter(g => {
    const full = `${g.brand} ${g.model}`.toUpperCase();
    if (full.includes('5090') && g.price < 80000) return true;
    if (full.includes('5080') && g.price < 40000) return true;
    if (full.includes('5070') && g.price < 20000) return true;
    if (full.includes('5060') && g.price < 9000) return true;
    if (full.includes('4090') && g.price < 50000) return true;
    if (full.includes('4080') && g.price < 30000) return true;
    if (full.includes('4070') && g.price < 18000) return true;
    if (full.includes('4060') && g.price < 9000) return true;
    if (full.includes('3060') && g.price < 7000) return true;
    if (full.includes('7900') && g.price < 20000) return true;
    if (full.includes('7800') && g.price < 15000) return true;
    if (full.includes('7700') && g.price < 12000) return true;
    if (full.includes('7600') && g.price < 8000) return true;
    if (full.includes('9070') && g.price < 18000) return true;
    if (full.includes('9060') && g.price < 9000) return true;
    return false;
  });

  console.log(`\nSuspicious/Mismatched GPU Prices found: ${suspiciousGpus.length}`);
  suspiciousGpus.forEach(g => {
    console.log(`⚠️ [${g.id}] "${g.brand} ${g.model}" -> ฿${parseFloat(g.price).toLocaleString()} | Chipset: ${g.chipset} | TDP: ${g.tdp_watt}W`);
  });

  await connection.end();
}

findPrice2490Items().catch(console.error);
