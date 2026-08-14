require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function fixDuplicatePsuSuffixes() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [psus] = await connection.query(`
    SELECT p.id, p.brand, p.model, psu.efficiency_rating
    FROM products p
    JOIN spec_psu psu ON p.id = psu.product_id
    WHERE p.category_id = 6
  `);

  for (const p of psus) {
    let m = p.model;
    m = m.replace(/80\+GOLD\s*/gi, '');
    m = m.replace(/80\+BRONZE\s*/gi, '');
    m = m.replace(/80\+SILVER\s*/gi, '');
    m = m.replace(/80\+WHITE\s*/gi, '');
    m = m.replace(/80\+PLATINUM\s*/gi, '');
    m = m.replace(/(80\s*Plus\s*(?:Gold|Silver|Bronze|White|Platinum|Titanium))\s+\1/gi, '$1');
    m = m.replace(/\s{2,}/g, ' ').trim();

    await connection.query(`UPDATE products SET model = ? WHERE id = ?`, [m, p.id]);
  }

  console.log('✅ Cleaned PSU models from redundant 80 Plus duplicates!');
  await connection.end();
}

fixDuplicatePsuSuffixes().catch(console.error);
