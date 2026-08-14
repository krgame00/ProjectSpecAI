require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function fixCpuSocketsGenuine() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  try {
    await connection.beginTransaction();

    const [cpus] = await connection.query(`
      SELECT p.id, p.brand, p.model, c.socket, c.cores, c.threads, c.tdp_watt
      FROM products p
      JOIN spec_cpu c ON p.id = c.product_id
      WHERE p.category_id = 1
    `);

    let updated = 0;
    for (const c of cpus) {
      const full = `${c.brand} ${c.model}`.toUpperCase();
      let realSocket = c.socket;

      // AMD Sockets
      if (full.includes('THREADRIPPER')) {
        realSocket = 'sTRX5';
      } else if (/\b(?:7\d{3}|8\d{3}|9\d{3})\b/.test(full) || full.includes('AM5') || full.includes('8400F') || full.includes('8500G') || full.includes('8700F')) {
        realSocket = 'AM5';
      } else if (/\b(?:1\d{3}|2\d{3}|3\d{3}|4\d{3}|5\d{3})\b/.test(full) || full.includes('AM4') || full.includes('ATHLON')) {
        realSocket = 'AM4';
      }
      // Intel Sockets
      else if (full.includes('ULTRA') || full.includes('1851') || full.includes('225') || full.includes('250') || full.includes('270') || full.includes('285')) {
        realSocket = 'LGA1851';
      } else if (full.includes('12400') || full.includes('12600') || full.includes('12700') || full.includes('12900') ||
                 full.includes('13400') || full.includes('13600') || full.includes('13700') || full.includes('13900') ||
                 full.includes('14100') || full.includes('14400') || full.includes('14600') || full.includes('14700') || full.includes('14900')) {
        realSocket = 'LGA1700';
      }

      if (realSocket !== c.socket) {
        await connection.query(`UPDATE spec_cpu SET socket = ? WHERE product_id = ?`, [realSocket, c.id]);
        console.log(`[${c.id}] ${c.brand} ${c.model} -> Socket changed from ${c.socket} to ${realSocket}`);
        updated++;
      }
    }

    await connection.commit();
    console.log(`\n✅ Updated ${updated} CPU sockets to their genuine sockets!`);

  } catch (err) {
    await connection.rollback();
    console.error(err);
    throw err;
  } finally {
    await connection.end();
  }
}

fixCpuSocketsGenuine().catch(console.error);
