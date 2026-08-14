require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function fixCpuCatalogDuplicatesAndPrices() {
  console.log('================================================================');
  console.log('🧹 CPU CATALOG DEDUPLICATION & AUTHENTIC PRICING REPAIR');
  console.log('================================================================\n');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  try {
    await connection.beginTransaction();

    // 1. DELETE DUPLICATE CPU ENTRIES (Die/Tray variants with wrong prices)
    // 12468 (dup of 11167 i5-12400F), 12472 (dup of 11041 i3-14100), 12478 (dup of 11045 i5-14400F)
    console.log('1️⃣ Deleting duplicate CPU entries...');
    await connection.query('DELETE FROM spec_cpu WHERE product_id IN (12468, 12472, 12478)');
    await connection.query('DELETE FROM products WHERE id IN (12468, 12472, 12478)');
    console.log('✅ Deleted 3 duplicate CPU rows (12468, 12472, 12478).');

    // 2. UPDATE AUTHENTIC MARKET PRICES & MODEL NAMES FOR REMAINING EXCELLENT CPUS
    console.log('\n2️⃣ Updating authentic market prices and names for unique high-end CPUs...');

    const cpuUpdates = [
      { id: 12479, model: 'Ryzen 7 8700F', price: 8990.00 },
      { id: 12480, model: 'Core i5 14400', price: 7490.00 },
      { id: 12481, model: 'Core i5 14600KF', price: 9990.00 },
      { id: 12483, model: 'Core i7 14700F', price: 12990.00 },
      { id: 12485, model: 'Core Ultra 7 265K', price: 15990.00 },
      { id: 12487, model: 'Ryzen 9 9900X', price: 16990.00 },
      { id: 12488, model: 'Core i9 14900K', price: 19990.00 }
    ];

    for (const item of cpuUpdates) {
      await connection.query('UPDATE products SET model = ?, price = ? WHERE id = ?', [item.model, item.price, item.id]);
    }
    console.log(`✅ Updated ${cpuUpdates.length} CPUs with authentic market pricing.`);

    await connection.commit();
    console.log('\n🏁 Transaction COMMITTED successfully!');

  } catch (err) {
    await connection.rollback();
    console.error(err);
    throw err;
  } finally {
    await connection.end();
  }
}

fixCpuCatalogDuplicatesAndPrices().catch(console.error);
