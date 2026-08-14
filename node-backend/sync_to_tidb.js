require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mysql = require('mysql2/promise');

async function syncToTiDB() {
  console.log('================================================================');
  console.log('☁️ SYNCHRONIZING SMART PC BUILDER DATABASE TO TIDB CLOUD');
  console.log('================================================================\n');

  const localDb = await mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const tidb = await mysql.createPool({
    host: process.env.TIDB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port: parseInt(process.env.TIDB_PORT || '4000'),
    user: process.env.TIDB_USER || '2zvWBJeXCf3SPRp.root',
    password: process.env.TIDB_PASSWORD || 'NyMNiTa4VWaKbEtL',
    database: process.env.TIDB_NAME || 'smart_pc_builder',
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
  });

  const tables = [
    'categories',
    'products',
    'spec_cpu',
    'spec_motherboard',
    'spec_ram',
    'spec_gpu',
    'spec_storage',
    'spec_psu',
    'spec_case',
    'articles',
    'users',
    'orders',
    'order_items'
  ];

  try {
    console.log('🔌 Connected to both Local MySQL and TiDB Cloud.');
    await tidb.query('SET FOREIGN_KEY_CHECKS = 0');
    
    for (const table of tables) {
      process.stdout.write(`Syncing table: ${table.padEnd(20)} ... `);
      const [rows] = await localDb.query(`SELECT * FROM ${table}`);
      
      // Clear TiDB table
      await tidb.query(`TRUNCATE TABLE ${table}`);
      
      if (rows.length === 0) {
        console.log('0 rows (skipped).');
        continue;
      }

      const columns = Object.keys(rows[0]);
      
      // Batch insert in chunks of 50
      for (let i = 0; i < rows.length; i += 50) {
        const chunk = rows.slice(i, i + 50);
        const values = [];
        const queryParams = [];
        
        for (const row of chunk) {
          const rowValues = [];
          for (const col of columns) {
            let val = row[col];
            if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
              val = JSON.stringify(val);
            }
            rowValues.push('?');
            queryParams.push(val);
          }
          values.push(`(${rowValues.join(', ')})`);
        }
        
        const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${values.join(',')}`;
        await tidb.query(query, queryParams);
      }
      
      // Verify count in TiDB
      const [countRes] = await tidb.query(`SELECT COUNT(*) as cnt FROM ${table}`);
      console.log(`✅ Synced ${countRes[0].cnt} rows.`);
    }

    await tidb.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('\n🎉 ALL TABLES SYNCHRONIZED TO TIDB CLOUD SUCCESSFULLY 100%!');

  } catch (err) {
    console.error('\n❌ Error during TiDB synchronization:', err);
    throw err;
  } finally {
    await localDb.end();
    await tidb.end();
  }
}

syncToTiDB().catch(console.error);
