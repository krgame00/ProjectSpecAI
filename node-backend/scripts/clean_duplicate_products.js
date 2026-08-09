require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function cleanDuplicates() {
  console.log('🔌 Connecting to MySQL database...');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  console.log('🔍 Identifying duplicate products by category_id and model...');
  const [dupes] = await conn.query(`
    SELECT category_id, model, GROUP_CONCAT(id ORDER BY id ASC) as ids, COUNT(*) as count
    FROM products
    GROUP BY category_id, model
    HAVING count > 1
  `);

  console.log(`⚠️ Found ${dupes.length} models with duplicate entries.`);

  let deletedCount = 0;
  for (const row of dupes) {
    const ids = row.ids.split(',').map(Number);
    const keepId = ids[0]; // Keep the first item
    const deleteIds = ids.slice(1); // Delete the rest

    console.log(`   Keeping ID ${keepId}, deleting duplicates: ${deleteIds.join(', ')} (${row.model.substring(0, 40)}...)`);

    // Delete from spec tables first if any
    const specTables = ['spec_cpu', 'spec_motherboard', 'spec_ram', 'spec_gpu', 'spec_storage', 'spec_psu', 'spec_case'];
    for (const table of specTables) {
      await conn.query(`DELETE FROM ${table} WHERE product_id IN (?)`, [deleteIds]);
    }

    // Delete from products table
    await conn.query(`DELETE FROM products WHERE id IN (?)`, [deleteIds]);
    deletedCount += deleteIds.length;
  }

  console.log(`\n✅ Successfully deleted ${deletedCount} duplicate product entries!`);

  // Verify remaining total
  const [tot] = await conn.query('SELECT count(*) as grand_total FROM products');
  console.log(`📊 Clean unique total products in MySQL: ${tot[0].grand_total}`);

  await conn.end();
}

cleanDuplicates().catch(err => {
  console.error('❌ Error cleaning duplicates:', err);
  process.exit(1);
});
