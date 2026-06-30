const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  try {
    const conn = await mysql.createConnection({host:'localhost', user:'root', password:'1234', database:'smart_pc_builder'});
    await conn.execute("UPDATE products SET image_url = '/images/hardware/amd_ryzen_5_5600g_1782740917662.png' WHERE brand = 'AMD' AND model LIKE '%5600G%'");
    await conn.execute("UPDATE products SET image_url = '/images/hardware/intel_core_i7_13700k_1782740929100.png' WHERE brand = 'Intel' AND model LIKE '%13700K%'");
    console.log('DB Updated.');
    conn.end();
  } catch(e) {
    console.error(e);
  }
}
run();
