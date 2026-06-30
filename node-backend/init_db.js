const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function run() {
  console.log('Connecting to MySQL...');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234'
  });

  console.log('Reading database-schema.sql...');
  const sqlPath = path.join(__dirname, '../database-schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Clean comments first
  const cleanSql = sql.replace(/--.*$/gm, '');

  // Parse SQL statements by splitting on semicolons
  const statements = cleanSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`Executing ${statements.length} SQL statements...`);
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await connection.query(stmt);
    } catch (err) {
      console.error(`Error executing statement ${i + 1}:`, err.message);
      console.error('Statement content:', stmt);
      await connection.end();
      process.exit(1);
    }
  }

  console.log('✅ Database smart_pc_builder initialized and seeded successfully.');
  await connection.end();
}

require('dotenv').config();
run().catch(err => {
  console.error('❌ Failed to initialize database:', err);
  process.exit(1);
});
