require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function auditAllPrefixes() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [products] = await connection.query(`SELECT id, category_id, brand, model FROM products ORDER BY id ASC`);

  console.log(`Total products in database: ${products.length}`);
  const badItems = [];

  for (const p of products) {
    const full = `${p.brand} ${p.model}`;
    const thaiPrefixMatch = /ซีพียู|เมนบอร์ด|แรม|การ์ด|เอสเอสดี|อุปกรณ์จ่ายไฟ|พาวเวอร์ซัพพลาย|เคส/i.test(full);
    const categoryWordMatch = /\b(?:CPU|VGA|MAINBOARD|RAM|SSD|PSU|CASE)\s*\(/i.test(full);
    const dupBrandMatch = /^(AMD|INTEL|GIGABYTE|ASUS|MSI|ASROCK)\s+\1\b/i.test(full);
    const socketPrefix = /\b(?:AM4|AM5|1700|1851|LGA1700|LGA1851)\s+(?:CORE|RYZEN)/i.test(full);

    if (thaiPrefixMatch || categoryWordMatch || dupBrandMatch || socketPrefix) {
      badItems.push({ id: p.id, category_id: p.category_id, brand: p.brand, model: p.model, full });
    }
  }

  console.log(`\nItems with uncleaned prefixes: ${badItems.length}`);
  badItems.forEach(b => console.log(`[${b.id}] (Cat ${b.category_id}) "${b.brand}" | "${b.model}"`));

  await connection.end();
}

auditAllPrefixes().catch(console.error);
