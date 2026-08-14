require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function checkNullRamMobos() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [nullRamMobos] = await connection.query(`
    SELECT p.id, p.brand, p.model, m.socket, m.ram_type, p.specifications
    FROM products p
    JOIN spec_motherboard m ON p.id = m.product_id
    WHERE m.ram_type IS NULL OR m.ram_type = ''
  `);

  console.log(`Analyzing ${nullRamMobos.length} motherboards with NULL ram_type...`);

  let ddr4Count = 0;
  let ddr5Count = 0;
  let undetermined = 0;

  nullRamMobos.forEach(m => {
    const text = `${m.model} ${JSON.stringify(m.specifications || {})}`.toUpperCase();
    let deduced = null;
    if (m.socket === 'AM5' || m.socket === 'LGA1851' || m.socket === 'LGA 1851') {
      deduced = 'DDR5'; // AM5 and LGA1851 only support DDR5
    } else if (m.socket === 'AM4') {
      deduced = 'DDR4'; // AM4 only supports DDR4
    } else if (text.includes('DDR5') || text.includes(' D5')) {
      deduced = 'DDR5';
    } else if (text.includes('DDR4') || text.includes(' D4')) {
      deduced = 'DDR4';
    }

    if (deduced === 'DDR4') ddr4Count++;
    else if (deduced === 'DDR5') ddr5Count++;
    else undetermined++;

    console.log(`ID ${m.id} | Socket: ${m.socket} | Deduced: ${deduced} | Model: ${m.model.slice(0, 60)}`);
  });

  console.log(`\nSummary: DDR5: ${ddr5Count}, DDR4: ${ddr4Count}, Undetermined: ${undetermined}`);

  await connection.end();
}

checkNullRamMobos().catch(console.error);
