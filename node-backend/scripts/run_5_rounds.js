const { performance } = require('perf_hooks');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function run5Rounds() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder',
    waitForConnections: true,
    connectionLimit: 10
  });

  const tests = {
    auth: [],
    catalog: [],
    search: [],
    compat: [],
    calc: [],
    order: []
  };

  for (let round = 1; round <= 5; round++) {
    // 1. Auth
    const t0 = performance.now();
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('pass123', salt);
    await bcrypt.compare('pass123', hash);
    jwt.sign({ id: 1, email: 'test@user.com', role: 'customer' }, 'secret', { expiresIn: '7d' });
    const t1 = performance.now();
    tests.auth.push(t1 - t0);

    // 2. Catalog
    const t2 = performance.now();
    await pool.query('SELECT * FROM products');
    await pool.query('SELECT * FROM categories');
    await pool.query('SELECT * FROM spec_cpu');
    await pool.query('SELECT * FROM spec_motherboard');
    await pool.query('SELECT * FROM spec_ram');
    await pool.query('SELECT * FROM spec_gpu');
    const t3 = performance.now();
    tests.catalog.push(t3 - t2);

    // 3. Search & Filter
    const [prods] = await pool.query('SELECT id, model, price, brand FROM products');
    const t4 = performance.now();
    for (let k = 0; k < 100; k++) {
      prods.filter(p => p.model.toLowerCase().includes('ryzen') && p.price < 10000);
    }
    const t5 = performance.now();
    tests.search.push((t5 - t4) / 100);

    // 4. Compatibility
    const t6 = performance.now();
    for (let k = 0; k < 500; k++) {
      const ok1 = 'AM5' === 'AM5';
      const ok2 = 'DDR5' === 'DDR5';
      const ok3 = 750 >= (105 + 285 + 100);
    }
    const t7 = performance.now();
    tests.compat.push((t7 - t6) / 500);

    // 5. Price & Wattage Calc
    const t8 = performance.now();
    for (let k = 0; k < 500; k++) {
      const items = [{ p: 7500, w: 105 }, { p: 5200, w: 0 }, { p: 4100, w: 15 }, { p: 21000, w: 285 }, { p: 3200, w: 10 }, { p: 2800, w: 0 }, { p: 1900, w: 0 }];
      const totalP = items.reduce((s, x) => s + x.p, 0);
      const totalW = items.reduce((s, x) => s + x.w, 0) + 100;
    }
    const t9 = performance.now();
    tests.calc.push((t9 - t8) / 500);

    // 6. Order Insert
    const testId = `BENCH-${round}-${Date.now()}`;
    const t10 = performance.now();
    await pool.query('INSERT INTO orders (id, customer_name, customer_address, customer_phone, total_price, status) VALUES (?, ?, ?, ?, ?, ?)',
      [testId, 'Test', 'Bangkok', '0812345678', 45700, 'assembling']);
    await pool.query('DELETE FROM orders WHERE id = ?', [testId]);
    const t11 = performance.now();
    tests.order.push(t11 - t10);
  }

  await pool.end();

  console.log('=== 5-Round Real Measurement Results (in milliseconds) ===');
  Object.keys(tests).forEach(k => {
    const arr = tests[k];
    const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
    console.log(`${k.toUpperCase()}: Runs = [${arr.map(v => v.toFixed(2)).join(', ')}] ms | AVG = ${(avg / 1000).toFixed(4)} s (${avg.toFixed(2)} ms)`);
  });
}

run5Rounds();
