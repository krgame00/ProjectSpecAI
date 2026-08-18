require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../config/db');

async function listChipsets() {
  const [rows] = await db.query(`
    SELECT DISTINCT g.chipset, COUNT(*) as count, AVG(g.tdp_watt) as avg_tdp
    FROM spec_gpu g
    GROUP BY g.chipset
    ORDER BY count DESC
  `);
  console.log('Distinct Chipsets:', rows);

  const [allGpus] = await db.query(`
    SELECT p.id, p.brand, p.model, g.chipset, g.tdp_watt
    FROM products p
    JOIN spec_gpu g ON p.id = g.product_id
  `);
  console.log(`Total GPUs: ${allGpus.length}`);
  if (db.pool) await db.pool.end();
}

listChipsets().catch(console.error);
