require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function inspectMisclassifiedItems() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  console.log('=== VGA items currently in Category 3 (RAM) ===');
  const [vgaInRam] = await connection.query(`
    SELECT p.id, p.category_id, p.brand, p.model, p.price, p.specifications,
           r.ram_type, r.capacity_gb, r.bus_speed
    FROM products p
    LEFT JOIN spec_ram r ON p.id = r.product_id
    WHERE p.category_id = 3 AND (p.model LIKE '%VGA%' OR p.model LIKE '%RADEON%' OR p.model LIKE '%GEFORCE%')
  `);
  console.table(vgaInRam);

  console.log('\n=== RAM items currently in Category 4 (GPU) ===');
  const [ramInGpu] = await connection.query(`
    SELECT p.id, p.category_id, p.brand, p.model, p.price, p.specifications,
           g.chipset, g.vram_gb, g.tdp_watt, g.length_mm
    FROM products p
    LEFT JOIN spec_gpu g ON p.id = g.product_id
    WHERE p.category_id = 4 AND (p.model LIKE '%RAM DDR%')
  `);
  console.table(ramInGpu);

  console.log('\n=== Check if any of these products are in order_items ===');
  const allIds = [...vgaInRam.map(i => i.id), ...ramInGpu.map(i => i.id)];
  if (allIds.length > 0) {
    const [ordered] = await connection.query(`
      SELECT * FROM order_items WHERE product_id IN (?)
    `, [allIds]);
    console.log(`Ordered items count among these: ${ordered.length}`);
    if (ordered.length > 0) console.table(ordered);
  }

  await connection.end();
}

inspectMisclassifiedItems().catch(console.error);
