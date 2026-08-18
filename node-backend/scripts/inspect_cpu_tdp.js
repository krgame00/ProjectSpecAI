require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../config/db');

async function inspectCpuTdp() {
  const [cpus] = await db.query(`
    SELECT p.id, p.brand, p.model, c.socket, c.cores, c.threads, c.tdp_watt
    FROM products p
    JOIN spec_cpu c ON p.id = c.product_id
    ORDER BY c.tdp_watt DESC
  `);
  console.log(`Total CPUs in spec_cpu: ${cpus.length}`);
  cpus.forEach(c => {
    console.log(`[ID ${c.id}] ${c.brand} ${c.model} | TDP: ${c.tdp_watt}W`);
  });
  if (db.pool) await db.pool.end();
}

inspectCpuTdp().catch(console.error);
