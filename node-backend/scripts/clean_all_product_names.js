require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function cleanAllProductNames() {
  console.log('================================================================');
  console.log('🧹 CLEANING PRODUCT NAMES IN DATABASE');
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

    // 1. Delete dummy item ID 12614 (ALL AMD AM4) if present
    await connection.query(`DELETE FROM spec_cpu WHERE product_id = 12614`);
    await connection.query(`DELETE FROM products WHERE id = 12614`);

    const [products] = await connection.query(`SELECT id, category_id, brand, model FROM products`);
    let updatedCount = 0;

    for (const p of products) {
      let b = p.brand ? p.brand.trim() : '';
      let m = p.model ? p.model.trim() : '';

      // Standardize Brand
      if (b.toUpperCase() === 'INTEL') b = 'Intel';
      else if (b.toUpperCase() === 'AMD') b = 'AMD';
      else if (b.toUpperCase() === 'NEXT' && p.category_id === 1) b = 'AMD';
      else if (b.toUpperCase() === 'GIGABYTE') b = 'Gigabyte';
      else if (b.toUpperCase() === 'ASUS') b = 'ASUS';
      else if (b.toUpperCase() === 'ASROCK') b = 'ASRock';
      else if (b.toUpperCase() === 'MSI') b = 'MSI';
      else if (b.toUpperCase() === 'COLORFUL') b = 'Colorful';
      else if (b.toUpperCase() === 'COLORFIRE') b = 'Colorfire';
      else if (b.toUpperCase() === 'KINGSTON') b = 'Kingston';
      else if (b.toUpperCase() === 'CORSAIR') b = 'Corsair';

      // Clean CPU (Category 1)
      if (p.category_id === 1) {
        m = m.replace(/^CPU\s*\(ซีพียู\)\s*/i, '');
        m = m.replace(/^CPU\s+/i, '');
        m = m.replace(/^AMD\s+/i, '');
        m = m.replace(/^INTEL\s+/i, '');
        m = m.replace(/^NEXT\s+/i, '');
        m = m.replace(/^(?:AM4|AM5|sTRX5|1700|1851|LGA1700|LGA1851)\s+/i, '');
        m = m.replace(/\s*\b\d+(?:\.\d+)?\s*GHz\b.*/i, '');
        m = m.replace(/\s*\b\d+\s*C\s*\d+\s*T\b.*/i, '');
        m = m.replace(/\s*\([^)]*(?:TRAY|BOX|MPK|3Y|Synnex|WTG|NEXT|REV|V\.\d|384MB)[^)]*\)/gi, '');
        m = m.replace(/\s*\(3Y\)/gi, '');
        m = m.replace(/\s*\(TRAY\)/gi, '');
        m = m.replace(/\s*\(MPK\)/gi, '');
        m = m.replace(/\s*\(BOX\)/gi, '');
        m = m.replace(/\s*\(NEXT\)/gi, '');
        m = m.trim();

        m = m.replace(/\bRYZEN\s+THREADRIPPER\s+PRO\s+/i, 'Ryzen Threadripper Pro ');
        m = m.replace(/\bTHREADRIPPER\s+PRO\s+/i, 'Ryzen Threadripper Pro ');
        m = m.replace(/\bCORE\s+ULTRA\s+(\d)/i, 'Core Ultra $1');
        m = m.replace(/\bULTRA\s+(\d)/i, 'Core Ultra $1');
        m = m.replace(/\bCORE\s+I(\d)/i, 'Core i$1');
        m = m.replace(/\bCORE\s+i(\d)/i, 'Core i$1');
        m = m.replace(/\bRYZEN\s+(\d)/i, 'Ryzen $1');
        m = m.replace(/\bATHLON\s+/i, 'Athlon ');
        m = m.replace(/\bPLUS\b/i, 'Plus');
        m = m.replace(/\bCore\s+Core\b/gi, 'Core');
        m = m.replace(/\bRyzen\s+Ryzen\b/gi, 'Ryzen');

        if (m.toLowerCase().startsWith('amd ')) m = m.slice(4).trim();
        if (m.toLowerCase().startsWith('intel ')) m = m.slice(6).trim();
      }

      // Clean GPU (Category 4)
      if (p.category_id === 4) {
        m = m.replace(/^VGA\s*\(การ์ดจอ\)\s*/i, '');
        m = m.replace(/^VGA\s+/i, '');
        const brandRegex = new RegExp(`^${b}\\s+`, 'i');
        m = m.replace(brandRegex, '').trim();
      }

      // Clean Mobo (Category 2)
      if (p.category_id === 2) {
        m = m.replace(/^MAINBOARD\s*\(เมนบอร์ด\)\s*(?:\([^)]+\)\s*)?/i, '');
        m = m.replace(/^MAINBOARD\s+/i, '');
        const brandRegex = new RegExp(`^${b}\\s+`, 'i');
        m = m.replace(brandRegex, '').trim();
      }

      // Clean RAM (Category 3)
      if (p.category_id === 3) {
        m = m.replace(/^RAM\s*\(แรม\)\s*/i, '');
        m = m.replace(/^RAM\s+/i, '');
        const brandRegex = new RegExp(`^${b}\\s+`, 'i');
        m = m.replace(brandRegex, '').trim();
      }

      // Clean Case (Category 7)
      if (p.category_id === 7) {
        m = m.replace(/^CASE\s*\(เคส\)\s*/i, '');
        m = m.replace(/^CASE\s+/i, '');
        const brandRegex = new RegExp(`^${b}\\s+`, 'i');
        m = m.replace(brandRegex, '').trim();
      }

      // Clean Storage (Category 5)
      if (p.category_id === 5) {
        m = m.replace(/^(?:M\.2|SSD)\s*\(เอสเอสดี\)\s*/i, '');
        const brandRegex = new RegExp(`^${b}\\s+`, 'i');
        m = m.replace(brandRegex, '').trim();
      }

      // Clean PSU (Category 6)
      if (p.category_id === 6) {
        m = m.replace(/^PSU\s*\(อุปกรณ์จ่ายไฟ\)\s*/i, '');
        m = m.replace(/^PSU\s+/i, '');
        const brandRegex = new RegExp(`^${b}\\s+`, 'i');
        m = m.replace(brandRegex, '').trim();
      }

      if (b !== p.brand || m !== p.model) {
        await connection.query(`UPDATE products SET brand = ?, model = ? WHERE id = ?`, [b, m, p.id]);
        updatedCount++;
      }
    }

    await connection.commit();
    console.log(`✅ Successfully cleaned up ${updatedCount} products in database!\n`);

  } catch (err) {
    await connection.rollback();
    console.error('Failed to clean products:', err);
    throw err;
  } finally {
    await connection.end();
  }
}

cleanAllProductNames().catch(console.error);
