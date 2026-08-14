require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function findMisclassifiedProducts() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [all] = await connection.query(`
    SELECT p.id, p.category_id, cat.slug, p.brand, p.model, p.price, p.image_url
    FROM products p
    JOIN categories cat ON p.category_id = cat.id
    ORDER BY p.id ASC
  `);

  console.log('=== Checking for Category Mismatches and Junk Items ===');

  const misplaced = [];
  const junk = [];

  for (const p of all) {
    const text = `${p.brand} ${p.model}`.toLowerCase();
    
    // Junk check (like "ALL Mainboard", "ALL CPU", etc.)
    if (p.brand === 'ALL' || p.model.startsWith('ALL ') || p.model.includes('ไร้ HDD') || p.brand === 'Generic') {
      junk.push(p);
    }

    // Misplaced check
    if (p.slug === 'cpu' && (text.includes('mainboard') || text.includes('vga') || text.includes('ram ddr') || text.includes('power supply'))) {
      misplaced.push({ item: p, suspected: 'Not CPU' });
    } else if (p.slug === 'mobo' && (text.includes('vga') || text.includes('ram ddr') || text.includes('power supply') || text.includes('cpu (ซีพียู)'))) {
      misplaced.push({ item: p, suspected: 'Not Mobo' });
    } else if (p.slug === 'ram' && (text.includes('vga') || text.includes('mainboard') || text.includes('power supply') || text.includes('case'))) {
      misplaced.push({ item: p, suspected: 'GPU in RAM' });
    } else if (p.slug === 'gpu' && (text.includes('ram ddr') || text.includes('mainboard') || text.includes('power supply') || text.includes('cpu (ซีพียู)'))) {
      misplaced.push({ item: p, suspected: 'RAM/CPU in GPU' });
    } else if (p.slug === 'psu' && (text.includes('vga') || text.includes('mainboard') || text.includes('ram ddr'))) {
      misplaced.push({ item: p, suspected: 'Not PSU' });
    } else if (p.slug === 'case' && (text.includes('vga') || text.includes('mainboard') || text.includes('ram ddr'))) {
      misplaced.push({ item: p, suspected: 'Not Case' });
    }
  }

  console.log(`\n🚨 Found ${misplaced.length} Misplaced Items:`);
  misplaced.forEach(m => console.log(`[${m.item.id}] [Category: ${m.item.slug}] ${m.item.brand} ${m.item.model} -> Suspected: ${m.suspected}`));

  console.log(`\n🗑️ Found ${junk.length} Junk / NAS / Dummy Items:`);
  junk.forEach(j => console.log(`[${j.id}] [Category: ${j.slug}] ${j.brand} ${j.model} (Price: ${j.price})`));

  await connection.end();
}

findMisclassifiedProducts().catch(console.error);
