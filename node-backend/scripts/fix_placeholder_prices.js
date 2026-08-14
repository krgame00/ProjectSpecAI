require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function fixAllPlaceholderPricesAndGpuPsus() {
  console.log('================================================================');
  console.log('💰 GLOBAL PRICE & GPU REC. PSU NORMALIZATION');
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

    // 1. FIX GPU PRICES & REC. PSU WATTAGE
    console.log('1️⃣ Normalizing GPU Prices and Recommended PSU Wattages...');

    const gpuUpdates = [
      { id: 12547, price: 11990.00, psu: 550, len: 240 }, // Colorful RTX 5060 Ultra Duo
      { id: 12548, price: 14990.00, psu: 650, len: 260 }, // Sapphire RX 9060 XT Pulse
      { id: 12551, price: 12490.00, psu: 550, len: 310 }, // Colorful RTX 5060 Ultra 3-Fan
      { id: 12552, price: 6990.00,  psu: 500, len: 205 }, // MSI RTX 3050 Ventus 2X
      { id: 12557, price: 8990.00,  psu: 500, len: 242 }, // Palit RTX 5050 Dual
      { id: 12560, price: 14990.00, psu: 600, len: 250 }, // Inno3D RTX 5060 Ti Twin X2
      { id: 12561, price: 15490.00, psu: 600, len: 251 }  // Galax RTX 5060 Ti 1-Click OC
    ];

    for (const g of gpuUpdates) {
      await connection.query('UPDATE products SET price = ? WHERE id = ?', [g.price, g.id]);
      await connection.query('UPDATE spec_gpu SET tdp_watt = ?, length_mm = ? WHERE product_id = ?', [g.psu, g.len, g.id]);
      
      // Update JSON specifications
      const [rows] = await connection.query('SELECT specifications FROM products WHERE id = ?', [g.id]);
      let specObj = typeof rows[0].specifications === 'string' ? JSON.parse(rows[0].specifications || '{}') : (rows[0].specifications || {});
      specObj['Power Requirement'] = `${g.psu}W`;
      specObj['Card Dimensions'] = `${g.len} mm`;
      await connection.query('UPDATE products SET specifications = ? WHERE id = ?', [JSON.stringify(specObj), g.id]);
    }
    console.log(`✅ Fixed ${gpuUpdates.length} GPUs with authentic pricing and Rec. PSU.`);

    // 2. FIX RAM PRICES
    console.log('\n2️⃣ Normalizing RAM prices...');
    const ramUpdates = [
      { id: 12517, price: 690.00 },  // HIKSEMI 8GB DDR4
      { id: 12525, price: 1390.00 }, // ADATA D35 16GB (8x2) DDR4
      { id: 12526, price: 1290.00 }, // HIKSEMI 16GB (8x2) DDR4
      { id: 12530, price: 1990.00 }, // ADATA 16GB DDR5
      { id: 12531, price: 2190.00 }, // Apacer 16GB DDR5
      { id: 12536, price: 3890.00 }  // Corsair Vengeance 32GB (16x2) DDR5
    ];

    for (const r of ramUpdates) {
      await connection.query('UPDATE products SET price = ? WHERE id = ?', [r.price, r.id]);
    }
    console.log(`✅ Fixed ${ramUpdates.length} RAM prices.`);

    // 3. FIX CASES
    console.log('\n3️⃣ Normalizing Case prices...');
    const caseUpdates = [
      { id: 12729, price: 2590.00 }, // DeepCool CH170 Digital
      { id: 12907, price: 4990.00 }  // Gigabyte C500 Panoramic Stealth
    ];

    for (const c of caseUpdates) {
      await connection.query('UPDATE products SET price = ? WHERE id = ?', [c.price, c.id]);
    }
    console.log(`✅ Fixed ${caseUpdates.length} Case prices.`);

    // 4. FIX STORAGE
    console.log('\n4️⃣ Normalizing Storage price...');
    await connection.query('UPDATE products SET price = 1190.00 WHERE id = 12688'); // HIKSEMI WAVE S480 480GB

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

fixAllPlaceholderPricesAndGpuPsus().catch(console.error);
