require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function cleanAndNormalizeRam() {
  console.log('================================================================');
  console.log('🧹 RAM NAMES & ATTRIBUTES NORMALIZATION');
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

    const [rams] = await connection.query(`
      SELECT p.id, p.brand, p.model, r.ram_type, r.capacity_gb, r.bus_speed, p.specifications
      FROM products p
      JOIN spec_ram r ON p.id = r.product_id
      WHERE p.category_id = 3
      ORDER BY p.id ASC
    `);

    let updated = 0;
    for (const r of rams) {
      let b = r.brand.trim();
      let m = r.model.trim();

      // Brand standardizations
      if (b === 'KINGBANK') b = 'KingBank';
      else if (b === 'PREDATOR') b = 'Predator';
      else if (b === 'BLACKBERRY') b = 'Blackberry';
      else if (b === 'HYNIX') b = 'Hynix';

      // Fix legacy Blackberry / Hynix RAM strings: "DDR3(1600) 4GB BLACKBERRY 8 CHIP" -> "4GB DDR3 1600MHz (8-Chip)"
      if (m.startsWith('DDR2(') || m.startsWith('DDR3(') || m.startsWith('DDR3L(')) {
        const match = m.match(/DDR(\w+)\((\d+)\)\s*(\d+GB)\s*(?:BLACKBERRY|HYNIX|APACER)?\s*(?:(\d+)\s*CHIP)?/i);
        if (match) {
          const type = `DDR${match[1]}`;
          const speed = `${match[2]}MHz`;
          const cap = match[3];
          const chip = match[4] ? ` (${match[4]}-Chip)` : '';
          m = `${cap} ${type} ${speed}${chip}`;
        }
      }

      // Remove long part numbers inside parenthesis at the end (e.g. (KF432C16BB/8WP), (AX5U6000C4816G-SLABBK), (BL.9BWWR.650))
      // But keep config parentheses like (8x2), (16x1), (32x2)
      m = m.replace(/\s*\(\s*(?:[A-Z0-9.\-\/]{6,})\s*\)/gi, '');
      m = m.replace(/\s*\(\s*(?:[A-Z0-9.\-\/]+(?:WP|BK|NA|WW|BEU|TH|3BTH|THX))\s*\)/gi, '');

      // Standardize (8X1) -> (8x1), (16X1) -> (16x1), (8X2) -> (8x2)
      m = m.replace(/\((\d+)[Xx](\d+)\)/g, '($1x$2)');

      // Clean U-DIMM / SODIMM noise if in middle
      m = m.replace(/\s*U-DIMM\s*/gi, ' ');
      m = m.replace(/\s+D35\b/g, ' D35');

      // Strip brand from model if starts with brand
      const brandRegex = new RegExp(`^${b}\\s+`, 'i');
      m = m.replace(brandRegex, '');

      // Clean multiple spaces
      m = m.replace(/\s{2,}/g, ' ').trim();

      // Extract config (e.g. (8x2), (16x1)) and color for specifications
      let config = null;
      const cfgMatch = m.match(/\((\d+x\d+)\)/);
      if (cfgMatch) config = `${r.capacity_gb}GB (${cfgMatch[1]})`;
      else config = `${r.capacity_gb}GB`;

      let color = 'Black';
      if (/WHITE/i.test(m)) color = 'White';
      else if (/SILVER/i.test(m)) color = 'Silver';
      else if (/GREY|GRAY/i.test(m)) color = 'Grey';
      else if (/RGB/i.test(m)) color = 'RGB Black';

      // Update specifications JSON
      let specObj = typeof r.specifications === 'string' ? JSON.parse(r.specifications || '{}') : (r.specifications || {});
      specObj['Brand'] = b;
      specObj['Memory Type'] = r.ram_type;
      specObj['Capacity'] = config;
      specObj['Speed'] = `${r.bus_speed} MHz`;
      specObj['Color'] = color;
      specObj['Warranty'] = specObj['Warranty'] || 'Limited Lifetime (LT)';

      const jsonStr = JSON.stringify(specObj);

      await connection.query(`
        UPDATE products SET brand = ?, model = ?, specifications = ? WHERE id = ?
      `, [b, m, jsonStr, r.id]);

      updated++;
    }

    await connection.commit();
    console.log(`✅ Successfully cleaned and normalized all ${updated} RAM products!`);

  } catch (err) {
    await connection.rollback();
    console.error(err);
    throw err;
  } finally {
    await connection.end();
  }
}

cleanAndNormalizeRam().catch(console.error);
