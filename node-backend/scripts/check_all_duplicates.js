require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function checkAllDuplicates() {
  console.log('================================================================');
  console.log('🔍 DEEP AUDIT: CHECKING DUPLICATE DATA IN DATABASE');
  console.log('================================================================\n');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  // 1. PRODUCTS DUPLICATE CHECK
  console.log('1️⃣ [PRODUCTS: EXACT BRAND + MODEL DUPLICATES]');
  const [exactDupes] = await connection.query(`
    SELECT category_id, brand, model, COUNT(*) as count, GROUP_CONCAT(id) as ids, GROUP_CONCAT(price) as prices
    FROM products
    GROUP BY category_id, brand, model
    HAVING count > 1
    ORDER BY count DESC, category_id ASC
  `);

  console.log(`Found ${exactDupes.length} product groups with duplicate (Brand + Model):`);
  let totalDuplicateRows = 0;
  exactDupes.forEach(d => {
    totalDuplicateRows += (d.count - 1);
  });
  console.log(`Total redundant duplicate rows that can be pruned: ${totalDuplicateRows}`);

  // Summary by Category
  const [dupesByCat] = await connection.query(`
    SELECT c.slug, c.name_th, COUNT(d.model) as duplicate_groups, SUM(d.count - 1) as redundant_rows
    FROM (
      SELECT category_id, brand, model, COUNT(*) as count
      FROM products
      GROUP BY category_id, brand, model
      HAVING count > 1
    ) d
    JOIN categories c ON d.category_id = c.id
    GROUP BY c.slug, c.name_th
  `);
  console.table(dupesByCat);

  // Show top samples from each category
  console.log('\n--- Sample Duplicates Across Categories ---');
  for (const cat of dupesByCat) {
    console.log(`\n📂 Category: ${cat.slug} (${cat.name_th})`);
    const samples = exactDupes.filter(d => {
      // Find cat id from dupes
      return true;
    });
    const catDupes = exactDupes.filter(d => d.slug === cat.slug || exactDupes.indexOf(d) < 10);
  }

  const [topSamples] = await connection.query(`
    SELECT c.slug as category, p.brand, p.model, COUNT(*) as copies, GROUP_CONCAT(p.id ORDER BY p.id ASC) as ids, GROUP_CONCAT(p.price ORDER BY p.id ASC) as prices
    FROM products p
    JOIN categories c ON p.category_id = c.id
    GROUP BY p.category_id, p.brand, p.model
    HAVING copies > 1
    ORDER BY copies DESC, p.category_id ASC
    LIMIT 20
  `);
  console.table(topSamples);

  // 2. CHECK USERS DUPLICATES
  console.log('\n2️⃣ [USERS: DUPLICATE EMAIL CHECK]');
  const [userDupes] = await connection.query(`
    SELECT email, COUNT(*) as count, GROUP_CONCAT(id) as ids, GROUP_CONCAT(name) as names
    FROM users
    GROUP BY email
    HAVING count > 1
  `);
  if (userDupes.length > 0) {
    console.log(`⚠️ Found ${userDupes.length} duplicate emails in users:`);
    console.table(userDupes);
  } else {
    console.log('✅ No duplicate user emails found.');
  }

  // 3. CHECK ARTICLES DUPLICATES
  console.log('\n3️⃣ [ARTICLES: DUPLICATE TITLE CHECK]');
  const [articleDupes] = await connection.query(`
    SELECT title, COUNT(*) as count, GROUP_CONCAT(id) as ids
    FROM articles
    GROUP BY title
    HAVING count > 1
  `);
  if (articleDupes.length > 0) {
    console.log(`⚠️ Found ${articleDupes.length} duplicate articles:`);
    console.table(articleDupes);
  } else {
    console.log('✅ No duplicate articles found.');
  }

  // 4. CHECK FOREIGN KEY USAGE (Do any duplicate product IDs exist in order_items?)
  console.log('\n4️⃣ [CHECK DUPLICATE PRODUCT REFERENCES IN ORDERS]');
  const [orderItemProducts] = await connection.query(`
    SELECT oi.product_id, COUNT(*) as order_count, p.brand, p.model
    FROM order_items oi
    LEFT JOIN products p ON oi.product_id = p.id
    GROUP BY oi.product_id
  `);
  console.log(`Total ordered product references: ${orderItemProducts.length}`);
  orderItemProducts.forEach(op => {
    console.log(`  - Product ID ${op.product_id} (${op.brand} ${op.model}) is referenced in ${op.order_count} order(s)`);
  });

  await connection.end();
}

checkAllDuplicates().catch(console.error);
