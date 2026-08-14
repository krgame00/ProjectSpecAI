require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function inspectGpuProducts() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [gpus] = await connection.query(`
    SELECT p.id, p.brand, p.model, g.chipset, g.vram_gb, g.tdp_watt, g.length_mm, p.specifications
    FROM products p
    JOIN spec_gpu g ON p.id = g.product_id
    WHERE p.category_id = 4
    ORDER BY p.id ASC
  `);

  console.log(`Total GPUs in DB: ${gpus.length}`);
  gpus.slice(0, 30).forEach(g => {
    console.log(`[${g.id}] "${g.brand}" | "${g.model}" | Chipset: ${g.chipset} | VRAM: ${g.vram_gb}GB | TDP: ${g.tdp_watt}W | Len: ${g.length_mm}mm`);
  });

  await connection.end();
}

inspectGpuProducts().catch(console.error);
