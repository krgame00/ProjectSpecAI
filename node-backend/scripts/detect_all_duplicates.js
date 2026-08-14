require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function detectAllDuplicates() {
  console.log('================================================================');
  console.log('🔍 DEEP DUPLICATE DETECTION ACROSS ALL CATEGORIES');
  console.log('================================================================\n');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [categories] = await connection.query('SELECT * FROM categories ORDER BY id ASC');

  for (const cat of categories) {
    console.log(`\n📁 Category ${cat.id}: ${cat.slug} (${cat.name_th})`);

    const [products] = await connection.query(`
      SELECT id, brand, model, price, image_url, specifications
      FROM products
      WHERE category_id = ?
      ORDER BY id ASC
    `, [cat.id]);

    console.log(`Total items: ${products.length}`);

    // 1. Check exact brand + model duplicates
    const exactMap = {};
    products.forEach(p => {
      const key = `${p.brand.trim().toLowerCase()}:::${p.model.trim().toLowerCase()}`;
      if (!exactMap[key]) exactMap[key] = [];
      exactMap[key].push(p);
    });

    const exactDups = Object.values(exactMap).filter(arr => arr.length > 1);
    console.log(`- Exact (Brand + Model) duplicates: ${exactDups.length}`);
    exactDups.forEach(arr => {
      console.log(`  🔴 [Exact Dup] "${arr[0].brand} ${arr[0].model}" -> IDs: ${arr.map(x => x.id).join(', ')} | Prices: ${arr.map(x => x.price).join(', ')}`);
    });

    // 2. Check duplicate image URLs
    const imageMap = {};
    products.forEach(p => {
      if (p.image_url && !p.image_url.includes('placeholder')) {
        if (!imageMap[p.image_url]) imageMap[p.image_url] = [];
        imageMap[p.image_url].push(p);
      }
    });

    const imgDups = Object.values(imageMap).filter(arr => arr.length > 1);
    console.log(`- Duplicate Image URLs: ${imgDups.length}`);
    imgDups.forEach(arr => {
      console.log(`  🖼️ [Same Image] "${arr[0].image_url}" (${arr.length} items):`);
      arr.forEach(x => console.log(`      ID: ${x.id} | "${x.brand} ${x.model}" | ฿${x.price}`));
    });

    // 3. Check fuzzy/normalized duplicates (ignoring spaces, case, RGB, V2, REV, etc.)
    const fuzzyMap = {};
    products.forEach(p => {
      let norm = `${p.brand} ${p.model}`.toLowerCase();
      norm = norm.replace(/\s+/g, '');
      norm = norm.replace(/[^a-z0-9]/g, '');
      norm = norm.replace(/rgb/g, '');
      norm = norm.replace(/expo/g, '');
      norm = norm.replace(/black/g, '');
      norm = norm.replace(/white/g, '');

      if (!fuzzyMap[norm]) fuzzyMap[norm] = [];
      fuzzyMap[norm].push(p);
    });

    const fuzzyDups = Object.values(fuzzyMap).filter(arr => arr.length > 1);
    const potentialFuzzyDups = fuzzyDups.filter(arr => {
      // check if any pair in arr has same image or same price
      const imgSet = new Set(arr.map(x => x.image_url));
      const priceSet = new Set(arr.map(x => x.price));
      return imgSet.size < arr.length || priceSet.size < arr.length;
    });

    console.log(`- Potential Fuzzy/Near Duplicates (same image/price/specs): ${potentialFuzzyDups.length}`);
    potentialFuzzyDups.forEach(arr => {
      console.log(`  ⚠️ [Fuzzy Group] ${arr.map(x => `[${x.id}] "${x.brand} ${x.model}" (฿${x.price})`).join(' vs ')}`);
    });
  }

  await connection.end();
}

detectAllDuplicates().catch(console.error);
