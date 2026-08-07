require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const CATEGORY_IMAGES = {
  1: '/images/cpu.png',
  2: '/images/mobo.png',
  3: '/images/ram.png',
  4: '/images/gpu.png',
  5: '/images/storage.png',
  6: '/images/psu.png',
  7: '/images/case.png'
};

async function fixImages() {
  console.log('🔌 Connecting to MySQL database...');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  console.log('🔍 Auditing and updating product image URLs per category...\n');

  const badUrls = [
    'product1048_800.jpg',
    'products40588_800.jpg',
    'products123852_800.jpg'
  ];

  let totalUpdated = 0;

  for (const [catId, defaultImg] of Object.entries(CATEGORY_IMAGES)) {
    const [products] = await conn.query('SELECT id, model, image_url FROM products WHERE category_id = ?', [catId]);
    let catUpdated = 0;

    for (const p of products) {
      const isBad = badUrls.some(bad => p.image_url && p.image_url.includes(bad));
      const isMismatched = p.image_url && p.image_url.startsWith('/images/') && !p.image_url.includes('/hardware/') && p.image_url !== defaultImg;

      if (isBad || isMismatched || !p.image_url) {
        await conn.query('UPDATE products SET image_url = ? WHERE id = ?', [defaultImg, p.id]);
        catUpdated++;
        totalUpdated++;
      }
    }

    console.log(`✅ Category ID ${catId}: Updated ${catUpdated} / ${products.length} product images to default ${defaultImg}`);
  }

  console.log(`\n🎉 Total product images fixed: ${totalUpdated} items!`);
  await conn.end();
}

fixImages().catch(err => {
  console.error('❌ Fix error:', err);
  process.exit(1);
});
