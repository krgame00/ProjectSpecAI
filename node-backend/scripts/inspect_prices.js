require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function inspectPricesAndVariants() {
  console.log('================================================================');
  console.log('💰 DEEP PRICE & VARIANT AUDIT');
  console.log('================================================================\n');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  // 1. Inspect RTX 5090 / Top tier GPUs specifically
  console.log('1️⃣ [RTX 5090 / HIGH TIER GPU PRICING]');
  const [rtx5090s] = await connection.query(`
    SELECT id, brand, model, price, product_url, image_url
    FROM products
    WHERE model LIKE '%5090%'
    ORDER BY price DESC
  `);
  rtx5090s.forEach(r => {
    console.log(`[${r.id}] "${r.brand} ${r.model}" -> ฿${r.price} | URL: ${r.product_url}`);
  });

  // 2. Check Price Distributions and Identical Price Groups across all categories
  const [categories] = await connection.query('SELECT * FROM categories ORDER BY id ASC');

  for (const cat of categories) {
    const [priceGroups] = await connection.query(`
      SELECT price, COUNT(*) as count, GROUP_CONCAT(CONCAT(brand, ' ', model) SEPARATOR ' || ') as sample_products
      FROM products
      WHERE category_id = ?
      GROUP BY price
      HAVING count >= 3
      ORDER BY count DESC, price DESC
      LIMIT 5
    `, [cat.id]);

    console.log(`\n📁 Category ${cat.id}: ${cat.slug} - Most Frequent Price Points:`);
    priceGroups.forEach(g => {
      console.log(`   - ฿${g.price} (${g.count} products)`);
    });
  }

  await connection.end();
}

inspectPricesAndVariants().catch(console.error);
