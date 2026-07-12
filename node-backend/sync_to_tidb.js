const mysql = require('mysql2/promise');

async function sync() {
  const localDb = await mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'smart_pc_builder'
  });

  const tidb = await mysql.createPool({
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: '2zvWBJeXCf3SPRp.root',
    password: 'NyMNiTa4VWaKbEtL',
    database: 'smart_pc_builder',
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
  });

  try {
    console.log("Fetching local products...");
    const [localProducts] = await localDb.query('SELECT * FROM products');
    
    console.log(`Found ${localProducts.length} products locally. Syncing to TiDB...`);
    
    // Using TRUNCATE to reset TiDB products table before inserting
    await tidb.query('SET FOREIGN_KEY_CHECKS = 0');
    await tidb.query('TRUNCATE TABLE products');
    
    // Insert all local products to TiDB
    for (let i = 0; i < localProducts.length; i += 50) {
      const chunk = localProducts.slice(i, i + 50);
      const values = [];
      const queryParams = [];
      for (const p of chunk) {
        values.push('(?, ?, ?, ?, ?, ?, ?, ?, ?)');
        queryParams.push(p.id, p.category_id, p.brand, p.model, p.price, p.image_url, p.stock_quantity, p.created_at, JSON.stringify(p.specifications));
      }
      
      const query = `INSERT INTO products (id, category_id, brand, model, price, image_url, stock_quantity, created_at, specifications) VALUES ${values.join(',')}`;
      await tidb.query(query, queryParams);
      console.log(`Inserted chunk ${i} to ${i + chunk.length}`);
    }
    await tidb.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log("Sync complete!");
  } catch (err) {
    console.error("Error syncing:", err);
  } finally {
    await localDb.end();
    await tidb.end();
  }
}

sync();
