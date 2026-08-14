require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function cleanAndNormalizeGpus() {
  console.log('================================================================');
  console.log('🎮 GPU NAMES & ATTRIBUTES PURIFICATION');
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

    const [gpus] = await connection.query(`
      SELECT p.id, p.brand, p.model, g.chipset, g.vram_gb, g.tdp_watt, g.length_mm, p.specifications
      FROM products p
      JOIN spec_gpu g ON p.id = g.product_id
      WHERE p.category_id = 4
      ORDER BY p.id ASC
    `);

    let updated = 0;
    for (const g of gpus) {
      let b = g.brand.trim();
      let m = g.model.trim();

      // Standardize Title Case for GeForce and Radeon
      m = m.replace(/\bGEFORCE\s+RTX\b/gi, 'GeForce RTX');
      m = m.replace(/\bGEFORCE\s+GTX\b/gi, 'GeForce GTX');
      m = m.replace(/\bGEFORCE\s+GT\b/gi, 'GeForce GT');
      m = m.replace(/\bRADEON\s+RX\b/gi, 'Radeon RX');
      m = m.replace(/\bARC\s+A(\d+)\b/gi, 'Arc A$1');

      // Remove long part serial numbers in parentheses at the end:
      m = m.replace(/\s*\(\s*(?:[A-Z0-9.\-\/]{6,})\s*\)/gi, '');
      m = m.replace(/\s*\(\s*(?:DUAL|WHITE|BLACK|OC|LHR|V\d|REV\.\d|GDDR\d)\s*\)/gi, '');

      // Remove redundant " - 8GB GDDR6" if already has "8GB" or clean the hyphen format
      m = m.replace(/\s*-\s*(\d+GB\s*(?:GDDR\d[X]?|HBM\d)?)/gi, ' $1');
      // If "8G 8GB GDDR6" remove duplicate 8G
      m = m.replace(/\b(\d+)G\s+(\1GB)\b/gi, '$2');
      m = m.replace(/\bO(\d+)G\b/gi, '$1GB');

      // Strip brand from model if model starts with brand
      const brandRegex = new RegExp(`^${b}\\s+`, 'i');
      m = m.replace(brandRegex, '');

      // Clean multiple spaces
      m = m.replace(/\s{2,}/g, ' ').trim();

      // Extract Chipset cleanly for spec
      let cleanChipset = g.chipset || '';
      cleanChipset = cleanChipset.replace(/[™®]/g, '').trim();
      const chipMatch = m.match(/(GeForce\s+RTX\s+\d{4}(?:\s*Ti|\s*SUPER)?|GeForce\s+GTX\s+\d{4}(?:\s*Ti|\s*SUPER)?|GeForce\s+GT\s+\d{3,4}|Radeon\s+RX\s+\d{4}(?:\s*XTX|\s*XT|\s*GRE)?|Arc\s+A\d{3})/i);
      if (chipMatch) {
        cleanChipset = chipMatch[1];
      }

      // Extract Memory type
      const memType = m.includes('GDDR7') ? 'GDDR7' : (m.includes('GDDR6X') ? 'GDDR6X' : (m.includes('GDDR6') ? 'GDDR6' : (m.includes('GDDR5') ? 'GDDR5' : 'GDDR6')));
      const vramStr = `${g.vram_gb} GB ${memType}`;

      // Update specifications JSON
      let specObj = typeof g.specifications === 'string' ? JSON.parse(g.specifications || '{}') : (g.specifications || {});
      specObj['Brand'] = b;
      specObj['GPU Model'] = cleanChipset;
      specObj['VRAM'] = vramStr;
      specObj['Boost Clock'] = specObj['Boost Clock'] || '2450 MHz';
      specObj['Dimension'] = `${g.length_mm} mm`;
      specObj['Power Requirement'] = `${g.tdp_watt}W`;
      specObj['Warranty'] = specObj['Warranty'] || '3 Years';

      const jsonStr = JSON.stringify(specObj);

      await connection.query(`
        UPDATE products SET brand = ?, model = ?, specifications = ? WHERE id = ?
      `, [b, m, jsonStr, g.id]);

      await connection.query(`
        UPDATE spec_gpu SET chipset = ? WHERE product_id = ?
      `, [cleanChipset, g.id]);

      updated++;
    }

    await connection.commit();
    console.log(`✅ Successfully cleaned and normalized all ${updated} GPU products!`);

  } catch (err) {
    await connection.rollback();
    console.error(err);
    throw err;
  } finally {
    await connection.end();
  }
}

cleanAndNormalizeGpus().catch(console.error);
