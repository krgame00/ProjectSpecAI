require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../config/db');

async function inspectAllGpuTdp() {
  const [gpus] = await db.query(`
    SELECT p.id, p.brand, p.model, g.chipset, g.vram_gb, g.tdp_watt, g.length_mm
    FROM products p
    JOIN spec_gpu g ON p.id = g.product_id
    ORDER BY g.tdp_watt DESC
  `);
  console.log(`Total GPUs in spec_gpu: ${gpus.length}`);
  console.log('Sample GPUs by TDP:');
  gpus.forEach(g => {
    console.log(`[ID ${g.id}] ${g.brand} ${g.model} | Chipset: ${g.chipset} | TDP: ${g.tdp_watt}W`);
  });
  if (db.pool) await db.pool.end();
}

inspectAllGpuTdp().catch(console.error);
