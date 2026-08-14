require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function comprehensiveDeepBrandAndModelCleanup() {
  console.log('================================================================');
  console.log('🧹 COMPREHENSIVE BRAND, MODEL & SOCKET PURIFICATION');
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

    const [products] = await connection.query(`
      SELECT p.id, p.category_id, c.slug as category_slug, p.brand, p.model
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ORDER BY p.id ASC
    `);

    let updatedProducts = 0;
    let moboSocketUpdates = 0;

    for (const p of products) {
      let b = (p.brand || '').trim();
      let m = (p.model || '').trim();

      // 1. Extract Real Brand if brand is 'iHAVECPU' or 'Generic' or 'NEXT' or 'ALL'
      const brandExtractionList = [
        { test: /\bASUS\b/i, brand: 'ASUS' },
        { test: /\bASROCK\b/i, brand: 'ASRock' },
        { test: /\bGIGABYTE\b/i, brand: 'Gigabyte' },
        { test: /\bMSI\b/i, brand: 'MSI' },
        { test: /\bCOLORFUL\b/i, brand: 'Colorful' },
        { test: /\bCOLORFIRE\b/i, brand: 'Colorfire' },
        { test: /\bLONGWELL\b/i, brand: 'LONGWELL' },
        { test: /\bCORSAIR\b/i, brand: 'Corsair' },
        { test: /\bKINGSTON\b/i, brand: 'Kingston' },
        { test: /\bHIKSEMI\b/i, brand: 'HIKSEMI' },
        { test: /\bAPACER\b/i, brand: 'Apacer' },
        { test: /\bADATA\b/i, brand: 'ADATA' },
        { test: /\bGALAX\b/i, brand: 'Galax' },
        { test: /\bINNO3D\b/i, brand: 'Inno3D' },
        { test: /\bZOTAC\b/i, brand: 'Zotac' },
        { test: /\bCOOLER\s*MASTER\b/i, brand: 'Cooler Master' },
        { test: /\bTHERMALTAKE\b/i, brand: 'Thermaltake' },
        { test: /\bDEEPCOOL\b/i, brand: 'DeepCool' },
        { test: /\bNZXT\b/i, brand: 'NZXT' },
        { test: /\bMONTECH\b/i, brand: 'Montech' },
        { test: /\bLIAN\s*LI\b/i, brand: 'Lian Li' },
        { test: /\bHYTE\b/i, brand: 'HYTE' },
        { test: /\bTRYX\b/i, brand: 'TRYX' },
        { test: /\bOCYPUS\b/i, brand: 'OCYPUS' },
        { test: /\bZALMAN\b/i, brand: 'Zalman' },
        { test: /\bFSP\b/i, brand: 'FSP' },
        { test: /\bAZZA\b/i, brand: 'AZZA' },
        { test: /\bAEROCOOL\b/i, brand: 'Aerocool' },
        { test: /\bSILVERSTONE\b/i, brand: 'SilverStone' },
        { test: /\bSEAGATE\b/i, brand: 'Seagate' },
        { test: /\bWESTERN\s*DIGITAL\b|\bWD\b/i, brand: 'Western Digital' },
        { test: /\bTOSHIBA\b/i, brand: 'Toshiba' },
        { test: /\bSAMSUNG\b/i, brand: 'Samsung' },
        { test: /\bLEXAR\b/i, brand: 'Lexar' },
        { test: /\bCRUCIAL\b/i, brand: 'Crucial' },
        { test: /\bSYNOLOGY\b/i, brand: 'Synology' },
        { test: /\bQNAP\b/i, brand: 'QNAP' },
        { test: /\bASUSTOR\b/i, brand: 'ASUSTOR' },
        { test: /\bTERRAMASTER\b/i, brand: 'TerraMaster' },
        { test: /\bAMD\b/i, brand: 'AMD' },
        { test: /\bINTEL\b/i, brand: 'Intel' }
      ];

      if (b === 'iHAVECPU' || b === 'Generic' || b === 'ALL' || b === 'NEXT' || b === '') {
        for (const entry of brandExtractionList) {
          if (entry.test.test(m)) {
            b = entry.brand;
            break;
          }
        }
      }

      // If still iHAVECPU for cases that are genuinely iHAVECPU brand (like IHC R09, CRYSTAL Z6), keep iHAVECPU
      if (b === 'iHAVECPU' && p.category_id === 7 && (/IHC|CRYSTAL|GLACIER|G390|PRISMA|K609/i.test(m))) {
        b = 'iHAVECPU';
      }

      // Standardize brand capitalization
      for (const entry of brandExtractionList) {
        if (b.toUpperCase() === entry.brand.toUpperCase()) {
          b = entry.brand;
          break;
        }
      }

      // 2. Clean Model String
      // Remove socket bracket prefixes e.g. (AM4), (AM5), (1700), (1851), (sTRX5)
      m = m.replace(/^\s*\((?:AM4|AM5|1700|1851|sTRX5|LGA1700|LGA1851)\)\s*/i, '');

      // Remove category prefixes
      m = m.replace(/^(?:CPU\s*\(ซีพียู\)|MAINBOARD\s*\(เมนบอร์ด\)|RAM\s*\(แรม\)|VGA\s*\(การ์ดจอ\)|PSU\s*\(อุปกรณ์จ่ายไฟ\)|CASE\s*\(เคส\)|(?:M\.2|SSD)\s*\(เอสเอสดี\))\s*/i, '');
      m = m.replace(/^(?:CPU|MAINBOARD|RAM|VGA|PSU|CASE|SSD)\s+/i, '');

      // Remove brand from start of model if repeated
      if (b) {
        const brandRegex = new RegExp(`^${b}\\s+`, 'i');
        m = m.replace(brandRegex, '');
      }

      // Remove warranty suffixes like (3Y), (5Y), (1Y), (2Y), (10Y), (7Y), (6Y), (4Y), (LT)
      m = m.replace(/\s*\(\s*(?:\d+Y|LT|Synnex|WTG|NEXT|REV|V\.\d|384MB)\s*\)/gi, '');
      m = m.replace(/\s*\(3Y\)/gi, '');
      m = m.replace(/\s*\(5Y\)/gi, '');
      m = m.replace(/\s*\(1Y\)/gi, '');
      m = m.replace(/\s*\(2Y\)/gi, '');
      m = m.replace(/\s*\(LT\)/gi, '');

      // Clean trailing and leading whitespace
      m = m.trim();

      if (b !== p.brand || m !== p.model) {
        await connection.query(`UPDATE products SET brand = ?, model = ? WHERE id = ?`, [b, m, p.id]);
        updatedProducts++;
      }

      // 3. FIX MOTHERBOARD REAL SOCKET
      if (p.category_id === 2) {
        const full = `${b} ${m}`.toUpperCase();
        let realSocket = null;

        if (/\b(?:A320|B350|X370|A520|B450|B550|X470|X570)\b/.test(full) || full.includes('AM4')) {
          realSocket = 'AM4';
        } else if (/\b(?:A620|B650|B840|B850|X670|X870)\b/.test(full) || full.includes('AM5')) {
          realSocket = 'AM5';
        } else if (/\b(?:H610|B660|B760|Z690|Z790)\b/.test(full) || full.includes('1700') || full.includes('LGA1700')) {
          realSocket = 'LGA1700';
        } else if (/\b(?:H810|B860|Z890)\b/.test(full) || full.includes('1851') || full.includes('LGA1851')) {
          realSocket = 'LGA1851';
        } else if (/\b(?:H77|H61|B75|1155)\b/.test(full)) {
          realSocket = 'LGA1155';
        }

        if (realSocket) {
          await connection.query(`
            UPDATE spec_motherboard SET socket = ? WHERE product_id = ?
          `, [realSocket, p.id]);
          moboSocketUpdates++;
        }
      }
    }

    console.log(`✅ Updated ${updatedProducts} product brands/models.`);
    console.log(`✅ Verified/fixed ${moboSocketUpdates} Motherboard sockets.`);

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

comprehensiveDeepBrandAndModelCleanup().catch(console.error);
