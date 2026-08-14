require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function deduplicateProducts() {
  console.log('================================================================');
  console.log('🚀 ACID DATABASE DEDUPLICATION MIGRATION');
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

    // 1. Fetch all products
    const [allProducts] = await connection.query(`
      SELECT p.*, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ORDER BY p.id ASC
    `);
    console.log(`Initial total products: ${allProducts.length}`);

    // 2. Fetch all referenced product IDs in order_items
    const [orderItems] = await connection.query(`SELECT DISTINCT product_id FROM order_items`);
    const orderedProductIds = new Set(orderItems.map(o => o.product_id));
    console.log(`Product IDs referenced in orders: [${Array.from(orderedProductIds).join(', ')}]`);

    // 3. Group products by (category_id, lowercase trimmed brand, lowercase trimmed model)
    const groups = new Map();
    for (const p of allProducts) {
      const key = `${p.category_id}:::${(p.brand || '').trim().toLowerCase()}:::${(p.model || '').trim().toLowerCase()}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(p);
    }

    let duplicateGroupsCount = 0;
    let totalDeleted = 0;
    const specTableMap = {
      cpu: 'spec_cpu',
      mobo: 'spec_motherboard',
      ram: 'spec_ram',
      gpu: 'spec_gpu',
      storage: 'spec_storage',
      psu: 'spec_psu',
      case: 'spec_case'
    };

    for (const [key, items] of groups.entries()) {
      if (items.length > 1) {
        duplicateGroupsCount++;

        // Determine the Keeper (Master)
        // Priority 1: Was it referenced in an order?
        let keeper = items.find(item => orderedProductIds.has(item.id));

        // Priority 2: Item with valid specifications or non-default image or earliest ID
        if (!keeper) {
          keeper = items[0]; // items are sorted by ID ASC
        }

        const deleteCandidates = items.filter(item => item.id !== keeper.id);

        for (const redundant of deleteCandidates) {
          // If the redundant item was referenced in order_items, re-link to keeper
          if (orderedProductIds.has(redundant.id)) {
            await connection.query(`
              UPDATE order_items SET product_id = ? WHERE product_id = ?
            `, [keeper.id, redundant.id]);
            console.log(`  ↪️ Re-linked order_item product_id from ${redundant.id} to keeper ${keeper.id}`);
          }

          // Delete from category spec table
          const specTable = specTableMap[redundant.category_slug];
          if (specTable) {
            await connection.query(`DELETE FROM ${specTable} WHERE product_id = ?`, [redundant.id]);
          }

          // Delete from products table
          await connection.query(`DELETE FROM products WHERE id = ?`, [redundant.id]);
          totalDeleted++;
        }
      }
    }

    console.log(`\nProcessed ${duplicateGroupsCount} duplicate groups.`);
    console.log(`Deleted ${totalDeleted} redundant duplicate product rows.`);

    // Verify post-migration count
    const [remainingProducts] = await connection.query(`SELECT COUNT(*) as count FROM products`);
    console.log(`Remaining pristine unique products: ${remainingProducts[0].count}`);

    await connection.commit();
    console.log('\n✅ ACID Transaction COMMITTED successfully!');

  } catch (err) {
    await connection.rollback();
    console.error('❌ Migration failed! Rolled back transaction.', err);
    throw err;
  } finally {
    await connection.end();
  }
}

deduplicateProducts().catch(console.error);
