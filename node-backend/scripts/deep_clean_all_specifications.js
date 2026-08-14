require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

function sanitizeProductSpec(spec, categorySlug, brand, model) {
  if (!spec || typeof spec !== 'object') return {};

  const clean = {};
  const isJunkKeyOrVal = (k, v) => {
    const sKey = String(k).toLowerCase().trim();
    const sVal = String(v).toLowerCase().trim();

    // 1. Scraping / Web artifacts
    if (sKey.includes('ad_') || sKey.includes('wait_for_update') || sKey.includes('analytics_') ||
        sKey.includes('original name') || sKey.includes('source') || sKey.includes('!--') ||
        sKey.includes('image_url') || sKey.includes('href') || sKey.includes('style') ||
        sKey.includes('script') || sKey.includes('iframe') || sKey.includes('meta') ||
        sKey.includes('fill') || sKey.includes('stroke') || sKey.includes('sketch') ||
        sKey.includes('xlink') || sKey.includes('evenodd') || sKey.includes('xmlns') ||
        sKey.includes('tagmanager') || sKey.includes('googleapis') || sKey.includes('cookie') ||
        sKey.startsWith('<')) {
      return true;
    }

    // 2. Scraped variant grid artifacts (e.g. '4 cores 8 threads Base')
    if (/\d+\s*cores?\s*\d+\s*threads?/i.test(sKey)) {
      return true;
    }

    // 3. Values with web artifacts
    if (sVal.includes('denied') || sVal.includes('granted') || sVal.includes('googletagmanager') ||
        sVal.includes('googleapis') || sVal.includes('cursor-pointer') || sVal.includes('rgb(') ||
        sVal.includes('display:') || sVal.includes('translate(')) {
      return true;
    }

    return false;
  };

  for (const [k, v] of Object.entries(spec)) {
    if (!isJunkKeyOrVal(k, v) && v !== null && v !== undefined && String(v).trim() !== '') {
      let val = String(v).trim();
      let key = k.trim();

      // Normalize long socket strings in specs
      if ((key === 'Socket' || key === 'Socket Type') && val.length > 15) {
        if (val.includes('AM4')) val = 'AM4';
        else if (val.includes('AM5')) val = 'AM5';
        else if (val.includes('1700') || val.includes('LGA1700')) val = 'LGA1700';
        else if (val.includes('1851') || val.includes('LGA1851')) val = 'LGA1851';
        else if (val.includes('sTRX5')) val = 'sTRX5';
      }

      clean[key] = val;
    }
  }

  // Remove redundant Socket if Socket Type exists
  if (clean['Socket'] && clean['Socket Type']) {
    delete clean['Socket'];
  }

  return clean;
}

async function deepCleanAllSpecifications() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  try {
    await connection.beginTransaction();

    const [products] = await connection.query(`
      SELECT p.id, p.category_id, c.slug as category_slug, p.brand, p.model, p.specifications
      FROM products p
      JOIN categories c ON p.category_id = c.id
    `);

    let updatedCount = 0;
    for (const p of products) {
      let raw = p.specifications;
      if (typeof raw === 'string') {
        try { raw = JSON.parse(raw); } catch(e) { raw = {}; }
      }
      const sanitized = sanitizeProductSpec(raw, p.category_slug, p.brand, p.model);
      const jsonStr = JSON.stringify(sanitized);

      if (jsonStr !== p.specifications) {
        await connection.query(`UPDATE products SET specifications = ? WHERE id = ?`, [jsonStr, p.id]);
        updatedCount++;
      }
    }

    await connection.commit();
    console.log(`✅ Deep cleaned specifications JSON for ${updatedCount} products!`);

  } catch (err) {
    await connection.rollback();
    console.error(err);
    throw err;
  } finally {
    await connection.end();
  }
}

deepCleanAllSpecifications().catch(console.error);
