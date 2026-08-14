require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function cleanAndNormalizeStorage() {
  console.log('================================================================');
  console.log('💾 STORAGE (SSD/HDD/NAS) NAMES & ATTRIBUTES PURIFICATION');
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

    const [storages] = await connection.query(`
      SELECT p.id, p.brand, p.model, s.type, s.capacity_gb, s.read_speed_mbs, s.write_speed_mbs, p.specifications
      FROM products p
      JOIN spec_storage s ON p.id = s.product_id
      WHERE p.category_id = 5
      ORDER BY p.id ASC
    `);

    let updated = 0;
    for (const s of storages) {
      let b = s.brand.trim();
      let m = s.model.trim();

      // Brand standardizations
      if (b === 'PREDATOR') b = 'Predator';
      else if (b === 'WD') b = 'Western Digital';

      // Fix legacy advice format: "1TB SSD M 2 NVME PCIE4 WD BLACK SN850X WDS100T2X0E"
      if (m.includes('SSD M 2 NVME') || m.includes('SSD SATA 2 5') || m.includes('SSD M 2 SATA')) {
        let capStr = m.match(/^(\d+(?:TB|GB))/i)?.[1] || (s.capacity_gb >= 1000 ? `${s.capacity_gb/1000}TB` : `${s.capacity_gb}GB`);
        let namePart = m.replace(/^\d+(?:TB|GB)\s+SSD\s+(?:M\s*2\s*NVME\s*PCIE[345]?|SATA\s*2\s*5)\s*/i, '');
        
        // Remove brand from namePart
        namePart = namePart.replace(new RegExp(`^${b}\\s+`, 'i'), '');
        namePart = namePart.replace(/^WD\s+/i, '');
        namePart = namePart.replace(/\s+[A-Z0-9\-\/]{6,}$/i, ''); // remove part number

        if (m.includes('SATA')) {
          m = `${namePart.trim()} ${capStr} 2.5" SATA III SSD`;
        } else {
          m = `${namePart.trim()} ${capStr} M.2 PCIe 4.0 NVMe`;
        }
      }

      // Remove long serial part numbers in parentheses at the end:
      m = m.replace(/\s*\(\s*(?:[A-Z0-9.\-\/]{6,})\s*\)/gi, '');
      m = m.replace(/\s*\(\s*(?:SNV3S\/\w+|MZ\s*\w+|WDS\w+|CT\d+\w+)\s*\)/gi, '');

      // Standardize PCIe/NVMe phrasing
      m = m.replace(/PCIe\s*4\s*\/\s*NVMe\s*M\.2\s*2280/gi, 'M.2 PCIe 4.0 NVMe');
      m = m.replace(/PCIe\s*\/\s*NVMe\s*GEN5\s*x?4/gi, 'M.2 PCIe 5.0 NVMe');
      m = m.replace(/PCIe\s*\/\s*NVMe\s*GEN4\s*x?4/gi, 'M.2 PCIe 4.0 NVMe');
      m = m.replace(/PCIe\s*\/\s*NVMe\s*GEN4/gi, 'M.2 PCIe 4.0 NVMe');
      m = m.replace(/PCIe\s*\/\s*NVMe\s*GEN3\s*x?4/gi, 'M.2 PCIe 3.0 NVMe');
      m = m.replace(/PCIe\s*\/\s*NVMe/gi, 'M.2 NVMe');

      // Strip brand from model if model starts with brand
      const brandRegex = new RegExp(`^${b}\\s+`, 'i');
      m = m.replace(brandRegex, '');

      // Clean multiple spaces
      m = m.replace(/\s{2,}/g, ' ').trim();

      // Determine realistic speeds & interface types
      const full = `${b} ${m}`.toUpperCase();
      let type = 'M.2 NVMe PCIe 4.0';
      let readSpeed = s.read_speed_mbs;
      let writeSpeed = s.write_speed_mbs;

      if (full.includes('GEN5') || full.includes('PCIE 5.0') || full.includes('NM990')) {
        type = 'M.2 NVMe PCIe 5.0';
        readSpeed = readSpeed && readSpeed > 1000 ? readSpeed : 14000;
        writeSpeed = writeSpeed && writeSpeed > 1000 ? writeSpeed : 7500;
      } else if (full.includes('SATA') || full.includes('2.5"') || full.includes('WAVE') || full.includes('NS100') || full.includes('BX500') || full.includes('A400')) {
        type = '2.5" SATA III SSD';
        readSpeed = 540;
        writeSpeed = 480;
      } else if (full.includes('NAS')) {
        type = full.includes('5-BAY') ? '5-Bay NAS' : (full.includes('6-BAY') ? '6-Bay NAS' : '4-Bay NAS');
      } else if (full.includes('EXTERNAL HDD') || full.includes('CANVIO') || full.includes('PASSPORT') || full.includes('ONE TOUCH') || full.includes('MY BOOK')) {
        type = 'External USB 3.2 HDD';
        readSpeed = 140;
        writeSpeed = 130;
      } else {
        // Standard M.2 NVMe PCIe 4.0 / 3.0
        type = 'M.2 NVMe PCIe 4.0';
        if (!readSpeed || readSpeed < 1000) {
          if (full.includes('SN850X') || full.includes('980 PRO') || full.includes('LEGEND 900') || full.includes('NM790') || full.includes('MP600') || full.includes('GM7')) {
            readSpeed = 7000;
            writeSpeed = 6000;
          } else if (full.includes('NV3') || full.includes('LEGEND 860') || full.includes('NQ790')) {
            readSpeed = 6000;
            writeSpeed = 5000;
          } else {
            readSpeed = 5000;
            writeSpeed = 4000;
          }
        }
      }

      // Update spec_storage
      await connection.query(`
        UPDATE spec_storage SET type = ?, read_speed_mbs = ?, write_speed_mbs = ? WHERE product_id = ?
      `, [type, readSpeed, writeSpeed, s.id]);

      // Update specifications JSON
      let specObj = typeof s.specifications === 'string' ? JSON.parse(s.specifications || '{}') : (s.specifications || {});
      const capStr = s.capacity_gb >= 1000 ? `${s.capacity_gb/1000} TB` : `${s.capacity_gb} GB`;

      specObj['Brand'] = b;
      specObj['Type'] = type;
      specObj['Capacity'] = capStr;
      if (!full.includes('NAS')) {
        specObj['Read Speed'] = `${readSpeed} MB/s`;
        specObj['Write Speed'] = `${writeSpeed} MB/s`;
        specObj['Form Factor'] = type.includes('M.2') ? 'M.2 2280' : (type.includes('2.5') ? '2.5 Inch' : 'Portable');
        specObj['Warranty'] = type.includes('NVMe') ? '5 Years' : '3 Years';
      }

      const jsonStr = JSON.stringify(specObj);

      await connection.query(`
        UPDATE products SET brand = ?, model = ?, specifications = ? WHERE id = ?
      `, [b, m, jsonStr, s.id]);

      updated++;
    }

    await connection.commit();
    console.log(`✅ Successfully cleaned and normalized all ${updated} Storage products!`);

  } catch (err) {
    await connection.rollback();
    console.error(err);
    throw err;
  } finally {
    await connection.end();
  }
}

cleanAndNormalizeStorage().catch(console.error);
