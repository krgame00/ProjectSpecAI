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

  const tables = [
    'products', 'spec_cpu', 'spec_motherboard', 'spec_ram', 
    'spec_gpu', 'spec_psu', 'spec_storage', 'spec_case'
  ];

  try {
    await tidb.query('SET FOREIGN_KEY_CHECKS = 0');
    
    for (const table of tables) {
      console.log(`Syncing table: ${table}`);
      const [rows] = await localDb.query(`SELECT * FROM ${table}`);
      
      await tidb.query(`TRUNCATE TABLE ${table}`);
      
      if (rows.length === 0) continue;

      const columns = Object.keys(rows[0]);
      
      for (let i = 0; i < rows.length; i += 50) {
        const chunk = rows.slice(i, i + 50);
        const values = [];
        const queryParams = [];
        
        for (const row of chunk) {
          const rowValues = [];
          for (const col of columns) {
            let val = row[col];
            // If the value is an object (like JSON), stringify it
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
      console.log(`Synced ${rows.length} rows for ${table}.`);
    }

    await tidb.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log("All tables synced successfully!");
  } catch (err) {
    console.error("Error syncing:", err);
  } finally {
    await localDb.end();
    await tidb.end();
  }
}

sync();
