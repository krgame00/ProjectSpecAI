require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const CPU_SPEC_DATABASE = {
  '3200G': { cores: 4, threads: 4, tdp: 65, socket: 'AM4', series: 'Ryzen 3000 Series', l3: '4 MB' },
  '3000G': { cores: 2, threads: 4, tdp: 35, socket: 'AM4', series: 'Athlon 3000 Series', l3: '4 MB' },
  '3400G': { cores: 4, threads: 8, tdp: 65, socket: 'AM4', series: 'Ryzen 3000 Series', l3: '4 MB' },
  '5500': { cores: 6, threads: 12, tdp: 65, socket: 'AM4', series: 'Ryzen 5000 Series', l3: '16 MB' },
  '5500GT': { cores: 6, threads: 12, tdp: 65, socket: 'AM4', series: 'Ryzen 5000 Series', l3: '16 MB' },
  '5600': { cores: 6, threads: 12, tdp: 65, socket: 'AM4', series: 'Ryzen 5000 Series', l3: '32 MB' },
  '5600G': { cores: 6, threads: 12, tdp: 65, socket: 'AM4', series: 'Ryzen 5000 Series', l3: '16 MB' },
  '5600GT': { cores: 6, threads: 12, tdp: 65, socket: 'AM4', series: 'Ryzen 5000 Series', l3: '16 MB' },
  '5700G': { cores: 8, threads: 16, tdp: 65, socket: 'AM4', series: 'Ryzen 5000 Series', l3: '16 MB' },
  '5800XT': { cores: 8, threads: 16, tdp: 105, socket: 'AM4', series: 'Ryzen 5000 Series', l3: '32 MB' },
  '7500F': { cores: 6, threads: 12, tdp: 65, socket: 'AM5', series: 'Ryzen 7000 Series', l3: '32 MB' },
  '7600': { cores: 6, threads: 12, tdp: 65, socket: 'AM5', series: 'Ryzen 7000 Series', l3: '32 MB' },
  '7600X': { cores: 6, threads: 12, tdp: 105, socket: 'AM5', series: 'Ryzen 7000 Series', l3: '32 MB' },
  '7700X3D': { cores: 8, threads: 16, tdp: 120, socket: 'AM5', series: 'Ryzen 7000 Series', l3: '96 MB' },
  '7800X3D': { cores: 8, threads: 16, tdp: 120, socket: 'AM5', series: 'Ryzen 7000 Series', l3: '96 MB' },
  '8400F': { cores: 6, threads: 12, tdp: 65, socket: 'AM5', series: 'Ryzen 8000 Series', l3: '16 MB' },
  '8500G': { cores: 6, threads: 12, tdp: 65, socket: 'AM5', series: 'Ryzen 8000 Series', l3: '16 MB' },
  '8700F': { cores: 8, threads: 16, tdp: 65, socket: 'AM5', series: 'Ryzen 8000 Series', l3: '16 MB' },
  '9600X': { cores: 6, threads: 12, tdp: 65, socket: 'AM5', series: 'Ryzen 9000 Series', l3: '32 MB' },
  '9700X': { cores: 8, threads: 16, tdp: 65, socket: 'AM5', series: 'Ryzen 9000 Series', l3: '32 MB' },
  '9800X3D': { cores: 8, threads: 16, tdp: 120, socket: 'AM5', series: 'Ryzen 9000 Series', l3: '96 MB' },
  '9850X3D': { cores: 8, threads: 16, tdp: 120, socket: 'AM5', series: 'Ryzen 9000 Series', l3: '96 MB' },
  '9900X': { cores: 12, threads: 24, tdp: 120, socket: 'AM5', series: 'Ryzen 9000 Series', l3: '64 MB' },
  '9950X': { cores: 16, threads: 32, tdp: 170, socket: 'AM5', series: 'Ryzen 9000 Series', l3: '64 MB' },
  '9950X3D': { cores: 16, threads: 32, tdp: 120, socket: 'AM5', series: 'Ryzen 9000 Series', l3: '128 MB' },
  '9950X3D2': { cores: 16, threads: 32, tdp: 120, socket: 'AM5', series: 'Ryzen 9000 Series', l3: '128 MB' },
  '7995WX': { cores: 96, threads: 192, tdp: 350, socket: 'sTRX5', series: 'Threadripper Pro', l3: '384 MB' },
  '14100': { cores: 4, threads: 8, tdp: 60, socket: 'LGA1700', series: 'Core i3 14th Gen', l3: '12 MB' },
  '12400F': { cores: 6, threads: 12, tdp: 65, socket: 'LGA1700', series: 'Core i5 12th Gen', l3: '18 MB' },
  '14400': { cores: 10, threads: 16, tdp: 65, socket: 'LGA1700', series: 'Core i5 14th Gen (6P+4E)', l3: '20 MB' },
  '14400F': { cores: 10, threads: 16, tdp: 65, socket: 'LGA1700', series: 'Core i5 14th Gen (6P+4E)', l3: '20 MB' },
  '14600KF': { cores: 14, threads: 20, tdp: 125, socket: 'LGA1700', series: 'Core i5 14th Gen (6P+8E)', l3: '24 MB' },
  '14700F': { cores: 20, threads: 28, tdp: 65, socket: 'LGA1700', series: 'Core i7 14th Gen (8P+12E)', l3: '33 MB' },
  '14700KF': { cores: 20, threads: 28, tdp: 125, socket: 'LGA1700', series: 'Core i7 14th Gen (8P+12E)', l3: '33 MB' },
  '14900K': { cores: 24, threads: 32, tdp: 125, socket: 'LGA1700', series: 'Core i9 14th Gen (8P+16E)', l3: '36 MB' },
  'CORE I7': { cores: 8, threads: 16, tdp: 65, socket: 'LGA1700', series: 'Core i7', l3: '16 MB' },
  '225': { cores: 10, threads: 10, tdp: 65, socket: 'LGA1851', series: 'Core Ultra Series 2', l3: '20 MB' },
  '225F': { cores: 10, threads: 10, tdp: 65, socket: 'LGA1851', series: 'Core Ultra Series 2', l3: '20 MB' },
  '250K PLUS': { cores: 14, threads: 14, tdp: 125, socket: 'LGA1851', series: 'Core Ultra Series 2', l3: '24 MB' },
  '250KF PLUS': { cores: 14, threads: 14, tdp: 125, socket: 'LGA1851', series: 'Core Ultra Series 2', l3: '24 MB' },
  '270K PLUS': { cores: 20, threads: 20, tdp: 125, socket: 'LGA1851', series: 'Core Ultra Series 2', l3: '30 MB' }
};

function matchCpuSpec(model) {
  const m = model.toUpperCase();
  for (const [key, spec] of Object.entries(CPU_SPEC_DATABASE)) {
    if (m.includes(key)) {
      return spec;
    }
  }
  return null;
}

function cleanSpecificationsJson(rawSpec, categorySlug, brand, model) {
  let spec = {};
  if (typeof rawSpec === 'string') {
    try { spec = JSON.parse(rawSpec); } catch(e) { spec = {}; }
  } else if (typeof rawSpec === 'object' && rawSpec !== null) {
    spec = { ...rawSpec };
  }

  const clean = {};
  const isJunkKey = (k, v) => {
    const sKey = String(k).toLowerCase();
    const sVal = String(v).toLowerCase();
    if (sKey.includes('fill') || sKey.includes('stroke') || sKey.includes('href') || sKey.includes('style') ||
        sKey.includes('iframe') || sKey.includes('script') || sKey.includes('meta') || sKey.includes('div') ||
        sKey.includes('body') || sKey.includes('tagmanager') || sKey.includes('storage') && (sVal.includes('denied') || sVal.includes('granted')) ||
        sKey.includes('image_url') || sKey.includes('clip-path') || sKey.includes('sketch') || sKey.includes('xlink') ||
        sKey.includes('evenodd') || sKey.includes('xmlns') || sKey.startsWith('<') || sKey.startsWith('!--')) {
      return true;
    }
    if (sVal.includes('googletagmanager') || sVal.includes('googleapis') || sVal.includes('cursor-pointer') ||
        sVal.includes('rgb(') || sVal.includes('display:') || sVal.includes('translate(')) {
      return true;
    }
    return false;
  };

  for (const [k, v] of Object.entries(spec)) {
    if (!isJunkKey(k, v) && v !== null && v !== undefined && String(v).trim() !== '') {
      clean[k.trim()] = typeof v === 'string' ? v.trim() : v;
    }
  }

  // If CPU category, enrich with pristine standard specifications
  if (categorySlug === 'cpu') {
    const matched = matchCpuSpec(model);
    if (matched) {
      clean['Brand'] = brand;
      clean['Series'] = matched.series;
      clean['Socket Type'] = matched.socket;
      clean['Cores'] = `${matched.cores} Cores`;
      clean['Threads'] = `${matched.threads} Threads`;
      clean['Default TDP'] = `${matched.tdp}W`;
      clean['L3 Cache'] = matched.l3;
      clean['Warranty'] = clean['Warranty'] || '3 Years';
    }
  }

  return clean;
}

async function fixAllCpuAndJsonSpecs() {
  console.log('================================================================');
  console.log('🧹 FIXING CPU SPECS TABLE & CLEANING SPECIFICATIONS JSON');
  console.log('================================================================\n');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  try {
    await connection.beginTransaction();

    // 1. Fetch all CPUs and update spec_cpu
    const [cpus] = await connection.query(`
      SELECT p.id, p.brand, p.model, c.socket, c.cores, c.threads, c.tdp_watt, p.specifications
      FROM products p
      LEFT JOIN spec_cpu c ON p.id = c.product_id
      WHERE p.category_id = 1
    `);

    let cpuSpecUpdates = 0;
    for (const c of cpus) {
      const matched = matchCpuSpec(c.model);
      if (matched) {
        // Update spec_cpu
        await connection.query(`
          INSERT INTO spec_cpu (product_id, socket, cores, threads, tdp_watt)
          VALUES (?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE socket = VALUES(socket), cores = VALUES(cores), threads = VALUES(threads), tdp_watt = VALUES(tdp_watt)
        `, [c.id, matched.socket, matched.cores, matched.threads, matched.tdp]);
        cpuSpecUpdates++;
      } else {
        console.warn(`⚠️ Could not match CPU spec for: [${c.id}] ${c.brand} ${c.model}`);
      }
    }
    console.log(`✅ Updated/verified ${cpuSpecUpdates} CPUs in spec_cpu!`);

    // 2. Clean specifications JSON across all 749 products
    const [allProducts] = await connection.query(`
      SELECT p.id, p.category_id, c.slug as category_slug, p.brand, p.model, p.specifications
      FROM products p
      JOIN categories c ON p.category_id = c.id
    `);

    let jsonCleanedCount = 0;
    for (const p of allProducts) {
      const cleanJson = cleanSpecificationsJson(p.specifications, p.category_slug, p.brand, p.model);
      const cleanJsonStr = JSON.stringify(cleanJson);
      
      if (cleanJsonStr !== p.specifications) {
        await connection.query(`UPDATE products SET specifications = ? WHERE id = ?`, [cleanJsonStr, p.id]);
        jsonCleanedCount++;
      }
    }
    console.log(`✅ Cleaned specifications JSON for ${jsonCleanedCount} products!`);

    await connection.commit();
    console.log('\n🏁 Transaction COMMITTED successfully!');

  } catch (err) {
    await connection.rollback();
    console.error(err);
    throw err;
  } finally {
    await connection.end();
  }
}

fixAllCpuAndJsonSpecs().catch(console.error);
