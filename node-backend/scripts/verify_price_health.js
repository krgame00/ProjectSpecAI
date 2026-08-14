require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function verifyPriceHealth() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  console.log('=== CHECKING PRICING INTEGRITY ===\n');

  // Check 0 or negative prices
  const [zeroPrices] = await connection.query('SELECT id, brand, model, price FROM products WHERE price <= 0');
  console.log(`- Zero or negative price products: ${zeroPrices.length}`);

  // Check price ranges per category
  const [catStats] = await connection.query(`
    SELECT c.slug, c.name_th, MIN(p.price) as min_p, MAX(p.price) as max_p, AVG(p.price) as avg_p, COUNT(*) as cnt
    FROM products p
    JOIN categories c ON p.category_id = c.id
    GROUP BY c.id
  `);

  console.log('\nPrice Ranges by Category:');
  catStats.forEach(s => {
    console.log(`   - ${s.name_th} (${s.slug}): ฿${parseFloat(s.min_p).toLocaleString()} - ฿${parseFloat(s.max_p).toLocaleString()} (Avg: ฿${Math.round(s.avg_p).toLocaleString()}) [${s.cnt} items]`);
  });

  await connection.end();
}

verifyPriceHealth().catch(console.error);
