require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function executeComprehensiveDuplicatePurge() {
  console.log('================================================================');
  console.log('🚀 FINAL DUPLICATE PURGE & JUNK TRACKING PIXEL REMOVAL');
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

    // 1. DELETE 51 JUNK TRACKING PIXEL / DUMMY STORAGE ITEMS
    console.log('1️⃣ Deleting junk tracking pixel dummy storage items (IDs 13030 - 13119)...');
    const [delStorageSpec] = await connection.query(`
      DELETE FROM spec_storage WHERE product_id IN (
        SELECT id FROM products WHERE id >= 13030 AND id <= 13119
      )
    `);
    const [delStorageProd] = await connection.query(`
      DELETE FROM products WHERE id >= 13030 AND id <= 13119
    `);
    console.log(`✅ Deleted ${delStorageProd.affectedRows} junk storage rows.`);

    // 2. MERGE & DELETE DUPLICATE PALIT RTX 3050 (ID 12538 vs 11455)
    console.log('\n2️⃣ Deduplicating Palit RTX 3050...');
    await connection.query(`DELETE FROM spec_gpu WHERE product_id = 12538`);
    await connection.query(`DELETE FROM products WHERE id = 12538`);
    console.log('✅ Deduplicated Palit RTX 3050.');

    // 3. MERGE & DELETE DUPLICATE CORSAIR VENGEANCE 64GB (ID 12771 vs 11269)
    console.log('\n3️⃣ Deduplicating Corsair Vengeance 64GB DDR5...');
    await connection.query(`
      UPDATE products 
      SET model = 'VENGEANCE RGB 64GB (32x2) DDR5 5600MHz Black',
          specifications = JSON_SET(specifications, '$.Color', 'RGB Black')
      WHERE id = 11269
    `);
    await connection.query(`DELETE FROM spec_ram WHERE product_id = 12771`);
    await connection.query(`DELETE FROM products WHERE id = 12771`);
    console.log('✅ Deduplicated Corsair Vengeance 64GB.');

    // 4. CLARIFY BLACK/WHITE CASE TITLES
    console.log('\n4️⃣ Clarifying Case Color Titles (Black vs White)...');
    const [cases] = await connection.query(`
      SELECT p.id, p.model, cs.form_factor_support, p.specifications
      FROM products p
      JOIN spec_case cs ON p.id = cs.product_id
      WHERE p.category_id = 7
    `);

    let caseColorFixed = 0;
    for (const c of cases) {
      let specObj = typeof c.specifications === 'string' ? JSON.parse(c.specifications || '{}') : (c.specifications || {});
      const color = specObj['Color'] || 'Black';

      if (!new RegExp(color, 'i').test(c.model)) {
        const newModel = `${c.model} ${color}`;
        await connection.query(`UPDATE products SET model = ? WHERE id = ?`, [newModel, c.id]);
        caseColorFixed++;
      }
    }
    console.log(`✅ Clarified ${caseColorFixed} Case color titles.`);

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

executeComprehensiveDuplicatePurge().catch(console.error);
