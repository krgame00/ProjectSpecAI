// Export TiDB/MySQL database -> SQLite .db file (single file, portable)
// Usage:
//   DB_HOST=... DB_PORT=4000 DB_USER=... DB_PASSWORD=... DB_NAME=smart_pc_builder DB_SSL=true \
//   node scripts/export_db_to_sqlite.js [output.db]
// Requires: npm install sqlite3  (run once)

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');

async function main() {
  const outDb = process.argv[2] || path.join(__dirname, '../../database-export/pcspec.db');
  fs.mkdirSync(path.dirname(outDb), { recursive: true });

  // 1. Connect MySQL/TiDB
  console.log('🔌 Connecting to MySQL/TiDB...');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'smart_pc_builder',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined
  });

  // 2. Create SQLite file
  const db = new sqlite3.Database(outDb);
  db.serialize(() => {
    db.run('PRAGMA journal_mode = WAL');

    // Fetch all tables
    const [tableRows] = awaitQuery(conn, 'SHOW TABLES');
    const dbName = process.env.DB_NAME || 'smart_pc_builder';
    const tableKey = `Tables_in_${dbName}`;

    (async () => {
      for (const row of tableRows) {
        const tableName = row[tableKey] || Object.values(row)[0];
        console.log(`📦 Exporting table: ${tableName}`);
        const [rows] = awaitQuery(conn, `SELECT * FROM \`${tableName}\``);
        const cols = rows.length ? Object.keys(rows[0]) : [];

        // Create table
        if (cols.length) {
          const colDefs = cols.map(c => `"${c}" TEXT`).join(', ');
          db.run(`DROP TABLE IF EXISTS "${tableName}"`);
          db.run(`CREATE TABLE "${tableName}" (${colDefs})`);
        }

        // Insert rows (serialize JSON values)
        const stmt = db.prepare(`INSERT INTO "${tableName}" (${cols.map(c => `"${c}"`).join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`);
        for (const r of rows) {
          const vals = cols.map(c => {
            let v = r[c];
            if (v !== null && typeof v === 'object') v = JSON.stringify(v);
            return v;
          });
          stmt.run(vals);
        }
        stmt.finalize();
        console.log(`  ✅ ${rows.length} rows`);
      }

      db.close();
      console.log(`\n🎉 Saved SQLite DB to: ${outDb} (${(fs.statSync(outDb).size / 1024 / 1024).toFixed(2)} MB)`);
      conn.end();
    })();
  });
}

function awaitQuery(conn, sql) {
  return new Promise((resolve, reject) => {
    conn.query(sql).then(resolve).catch(reject);
  });
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });