require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function testGpuPrices() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [gpus] = await connection.query(`
    SELECT p.id, p.brand, p.model, p.price, g.chipset, g.vram_gb, g.tdp_watt, g.length_mm
    FROM products p
    JOIN spec_gpu g ON p.id = g.product_id
    WHERE p.id IN (12547, 12548, 12551, 12552, 12557, 12560, 12561)
    ORDER BY p.id ASC
  `);

  console.log('=== TEST FIXED GPUS ===');
  gpus.forEach(g => {
    console.log(`[${g.id}] "${g.brand} ${g.model}" | ฿${parseFloat(g.price).toLocaleString()} | Chipset: ${g.chipset} | VRAM: ${g.vram_gb}GB | Rec PSU: ${g.tdp_watt}W | Length: ${g.length_mm}mm`);
  });

  await connection.end();
}

testGpuPrices().catch(console.error);
