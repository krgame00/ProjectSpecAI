require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function analyzeAllDuplicatesForCleanup() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  // Get all product IDs referenced in order_items (never delete these)
  const [orderItemRows] = await connection.query('SELECT DISTINCT product_id FROM order_items');
  const referencedIds = new Set(orderItemRows.map(r => r.product_id));

  console.log(`Protected Product IDs referenced in orders: [${Array.from(referencedIds).join(', ')}]\n`);

  // 1. Check Same Image duplicates
  const [products] = await connection.query(`
    SELECT p.id, p.category_id, c.slug as category_slug, p.brand, p.model, p.price, p.image_url
    FROM products p
    JOIN categories c ON p.category_id = c.id
    ORDER BY p.category_id ASC, p.id ASC
  `);

  const imgMap = {};
  products.forEach(p => {
    if (p.image_url && !p.image_url.includes('placeholder') && p.image_url !== '/images/storage.png' && p.image_url !== '/images/case.png') {
      if (!imgMap[p.image_url]) imgMap[p.image_url] = [];
      imgMap[p.image_url].push(p);
    }
  });

  const duplicateImageGroups = Object.entries(imgMap).filter(([img, arr]) => arr.length > 1);
  console.log(`=== 1. DUPLICATE IMAGE GROUPS (${duplicateImageGroups.length} groups) ===`);
  duplicateImageGroups.forEach(([img, arr]) => {
    console.log(`\n🖼️ Image: "${img}" (${arr.length} products):`);
    arr.forEach(p => {
      const isRef = referencedIds.has(p.id) ? ' [PROTECTED: ORDER ITEM]' : '';
      console.log(`   - ID: ${p.id} | (${p.category_slug}) "${p.brand} ${p.model}" | ฿${p.price}${isRef}`);
    });
  });

  // 2. Check Generic/Dummy storage items
  const [dummyStorage] = await connection.query(`
    SELECT id, brand, model, price, image_url
    FROM products
    WHERE category_id = 5 AND (id >= 13037 OR brand = 'Generic' OR model LIKE '%ตัวท็อป%' OR model LIKE '%สุดคุ้ม%' OR model LIKE '%ความเร็วสูง%')
  `);
  console.log(`\n=== 2. DUMMY / SCRAPED JUNK STORAGE ITEMS (${dummyStorage.length} items) ===`);
  dummyStorage.forEach(s => {
    const isRef = referencedIds.has(s.id) ? ' [PROTECTED]' : '';
    console.log(`   - ID: ${s.id} | "${s.brand} ${s.model}" | ฿${s.price}${isRef}`);
  });

  await connection.end();
}

analyzeAllDuplicatesForCleanup().catch(console.error);
