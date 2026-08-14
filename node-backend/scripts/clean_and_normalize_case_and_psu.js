require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function cleanAndNormalizeCaseAndPsu() {
  console.log('================================================================');
  console.log('🧹 CASE & PSU NAMES & ATTRIBUTES NORMALIZATION');
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

    // 1. CLEAN & NORMALIZE CASE (Category 7)
    console.log('1️⃣ Cleaning and normalizing Cases (Category 7)...');
    const [cases] = await connection.query(`
      SELECT p.id, p.brand, p.model, cs.form_factor_support, cs.max_gpu_length_mm, p.specifications
      FROM products p
      JOIN spec_case cs ON p.id = cs.product_id
      WHERE p.category_id = 7
      ORDER BY p.id ASC
    `);

    let caseUpdated = 0;
    for (const c of cases) {
      let b = c.brand.trim();
      let m = c.model.trim();

      // Brand standardizations
      if (b === 'THERMALTAKE') b = 'Thermaltake';
      else if (b === 'DEEPCOOL') b = 'DeepCool';
      else if (b === 'COOLER MASTER') b = 'Cooler Master';
      else if (b === 'MONTECH') b = 'Montech';
      else if (b === 'LIAN LI') b = 'Lian Li';
      else if (b === 'SEGOTEP x COLORFIRE') b = 'Segotep';

      // Detect Color before cleaning
      let color = 'Black';
      if (/WHITE|SNOW|ICE/i.test(m)) color = 'White';
      else if (/PINK/i.test(m)) color = 'Pink';
      else if (/SILVER/i.test(m)) color = 'Silver';
      else if (/GREEN|MATCHA/i.test(m)) color = 'Green';
      else if (/BLUE/i.test(m)) color = 'Blue';
      else if (/TURQUOISE/i.test(m)) color = 'Turquoise';
      else if (/CARAMEL|SAND/i.test(m)) color = 'Sand';
      else if (/GREY|GRAY|SMOKE/i.test(m)) color = 'Grey';

      // Detect Form Factor & Motherboard Support
      const full = `${b} ${m}`.toUpperCase();
      let formFactor = 'Mid Tower';
      let mbSupport = 'ATX, Micro-ATX, Mini-ITX';

      if (full.includes('E-ATX') || full.includes('FULL TOWER') || full.includes('TOWER 600') || full.includes('BF 360') || full.includes('Y60') || full.includes('X50') || full.includes('4500X') || full.includes('3500X') || full.includes('GT302')) {
        formFactor = 'Full Tower (E-ATX)';
        mbSupport = 'E-ATX, ATX, Micro-ATX, Mini-ITX';
      } else if (full.includes('MINI-ITX') || full.includes('CH160') || full.includes('CH170')) {
        formFactor = 'Mini-ITX';
        mbSupport = 'Mini-ITX';
      } else if (full.includes('MATX') || full.includes('MICRO') || full.includes('MINI-TOWER') || full.includes('TOWER 300') || full.includes('AP202') || full.includes('M100R') || full.includes('C102') || full.includes('R09') || full.includes('G390') || full.includes('R30') || full.includes('R03') || full.includes('R06') || full.includes('C52') || full.includes('C40') || full.includes('KING 15') || full.includes('2800X') || full.includes('MEOW')) {
        formFactor = 'Micro-ATX Mini Tower';
        mbSupport = 'Micro-ATX, Mini-ITX';
      } else {
        formFactor = 'ATX Mid Tower';
        mbSupport = 'ATX, Micro-ATX, Mini-ITX';
      }

      // Remove long part serials and brackets in model
      m = m.replace(/\s*\(\s*(?:[A-Z0-9.\-\/]{6,})\s*\)/gi, '');
      m = m.replace(/\s*\(\s*(?:BLACK|WHITE|PINK|SILVER|GREEN|BLUE|SAND|GREY|GRAY|SMOKE|BLACK\/BLACK|SNOW\/WHITE|SNOW|BLACK-SILVER)\s*\)/gi, '');
      m = m.replace(/\s*\(\s*(?:mATX|ATX|E-ATX|MINI-ITX)\s*\)/gi, '');
      m = m.replace(/\s*\(\s*(?:CC-[A-Z0-9\-]+|MF\d+M-[A-Z0-9\-]+)\s*\)/gi, '');
      m = m.replace(/\s*:\s*CC-[A-Z0-9\-]+/gi, '');
      m = m.replace(/\[2024\]|\[2025\]/g, '').trim();

      // Append clean Color suffix if not already mentioned in model
      if (!new RegExp(color, 'i').test(m) && color !== 'Black') {
        m = `${m} ${color}`;
      }

      // Strip brand from model
      const brandRegex = new RegExp(`^${b}\\s+`, 'i');
      m = m.replace(brandRegex, '');
      m = m.replace(/\s{2,}/g, ' ').trim();

      // Update spec_case
      await connection.query(`
        UPDATE spec_case SET form_factor_support = ? WHERE product_id = ?
      `, [mbSupport, c.id]);

      // Update specifications JSON
      let specObj = typeof c.specifications === 'string' ? JSON.parse(c.specifications || '{}') : (c.specifications || {});
      specObj['Brand'] = b;
      specObj['Form Factor'] = formFactor;
      specObj['Motherboard Support'] = mbSupport;
      specObj['Max GPU Length'] = `${c.max_gpu_length_mm || 350} mm`;
      specObj['CPU Cooler Support'] = formFactor.includes('ITX') ? '135 mm' : '165 mm';
      specObj['Color'] = color;
      specObj['Expansion Slots'] = formFactor.includes('ITX') ? '2 Slots' : (formFactor.includes('Micro') ? '4 Slots' : '7 Slots');
      specObj['Warranty'] = specObj['Warranty'] || (b === 'Corsair' || b === 'NZXT' || b === 'Thermaltake' ? '2 Years' : '1 Year');

      const jsonStr = JSON.stringify(specObj);

      await connection.query(`
        UPDATE products SET brand = ?, model = ?, specifications = ? WHERE id = ?
      `, [b, m, jsonStr, c.id]);

      caseUpdated++;
    }
    console.log(`✅ Cleaned and normalized ${caseUpdated} Cases.`);

    // 2. CLEAN & NORMALIZE PSU (Category 6)
    console.log('\n2️⃣ Cleaning and normalizing PSUs (Category 6)...');
    const [psus] = await connection.query(`
      SELECT p.id, p.brand, p.model, psu.wattage, psu.efficiency_rating, p.specifications
      FROM products p
      JOIN spec_psu psu ON p.id = psu.product_id
      WHERE p.category_id = 6
      ORDER BY p.id ASC
    `);

    let psuUpdated = 0;
    for (const p of psus) {
      let b = p.brand.trim();
      let m = p.model.trim();

      // Standardize brand
      if (b === 'COOLER MASTER') b = 'Cooler Master';
      else if (b === 'THERMALTAKE') b = 'Thermaltake';

      const full = `${b} ${m}`.toUpperCase();

      // Extract accurate efficiency
      let eff = '80 Plus Bronze';
      if (full.includes('TITANIUM') || full.includes('80+TITANIUM')) eff = '80 Plus Titanium';
      else if (full.includes('PLATINUM') || full.includes('80+PLATINUM')) eff = '80 Plus Platinum';
      else if (full.includes('GOLD') || full.includes('80+GOLD')) eff = '80 Plus Gold';
      else if (full.includes('SILVER') || full.includes('80+SILVER')) eff = '80 Plus Silver';
      else if (full.includes('BRONZE') || full.includes('80+BRONZE')) eff = '80 Plus Bronze';
      else if (full.includes('WHITE') || full.includes('80+WHITE') || full.includes('80 PLUS')) eff = '80 Plus White';

      // Clean long serial part numbers and brackets
      m = m.replace(/\s*\(\s*(?:[A-Z0-9.\-\/]{6,})\s*\)/gi, '');
      m = m.replace(/\s*\(\s*(?:80\+[A-Z\s]+|80\s*PLUS[A-Z\s]*)\s*\)/gi, '');
      m = m.replace(/\s*\(\s*(?:BLACK|WHITE)\s*\)/gi, '');
      m = m.replace(/\s*-\s*(\d+W)/gi, ' $1');

      // Append clean efficiency & wattage format
      if (!m.includes(eff)) {
        m = `${m} ${eff}`;
      }

      // Strip brand from model
      const brandRegex = new RegExp(`^${b}\\s+`, 'i');
      m = m.replace(brandRegex, '');
      m = m.replace(/\s{2,}/g, ' ').trim();

      // Update spec_psu
      await connection.query(`
        UPDATE spec_psu SET efficiency_rating = ? WHERE product_id = ?
      `, [eff, p.id]);

      // Update specifications JSON
      let specObj = typeof p.specifications === 'string' ? JSON.parse(p.specifications || '{}') : (p.specifications || {});
      specObj['Brand'] = b;
      specObj['Wattage'] = `${p.wattage}W`;
      specObj['Efficiency'] = eff;
      specObj['Modularity'] = (eff.includes('Gold') || eff.includes('Platinum') || eff.includes('Titanium')) ? 'Full Modular' : 'Non-Modular';
      specObj['Fan Size'] = '120 mm';
      specObj['Protections'] = 'OVP / OPP / SCP / UVP / OCP / OTP';
      specObj['Warranty'] = (eff.includes('Gold') || eff.includes('Platinum') || eff.includes('Titanium')) ? '5 Years' : '3 Years';

      const jsonStr = JSON.stringify(specObj);

      await connection.query(`
        UPDATE products SET brand = ?, model = ?, specifications = ? WHERE id = ?
      `, [b, m, jsonStr, p.id]);

      psuUpdated++;
    }
    console.log(`✅ Cleaned and normalized ${psuUpdated} PSUs.`);

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

cleanAndNormalizeCaseAndPsu().catch(console.error);
