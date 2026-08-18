require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../config/db');

async function check() {
  // 1. Get CPU 11163
  const [cpu] = await db.query(`
    SELECT p.id, p.brand, p.model, p.price, c.tdp_watt, p.specifications
    FROM products p
    LEFT JOIN spec_cpu c ON p.id = c.product_id
    WHERE p.id = 11163
  `);
  console.log('CPU 11163:', cpu);

  // 2. Get RTX 5060 GPUs
  const [gpus] = await db.query(`
    SELECT p.id, p.brand, p.model, p.price, g.tdp_watt, p.specifications
    FROM products p
    LEFT JOIN spec_gpu g ON p.id = g.product_id
    WHERE p.category_id = (SELECT id FROM categories WHERE slug='gpu')
      AND p.model LIKE '%5060%'
  `);
  console.log('GPUs 5060:', gpus);

  // 3. Let's see all GPUs and their tdp_watt
  const [allGpus] = await db.query(`
    SELECT p.id, p.brand, p.model, g.tdp_watt, p.specifications
    FROM products p
    LEFT JOIN spec_gpu g ON p.id = g.product_id
    WHERE p.category_id = (SELECT id FROM categories WHERE slug='gpu')
    LIMIT 20
  `);
  console.log('All GPUs sample TDP:', allGpus);

  if (db.pool) await db.pool.end();
}

check().catch(console.error);
