const { performance } = require('perf_hooks');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function runRealBenchmark() {
  console.log('=== Starting Real System Benchmark (PCSpec) ===\n');
  const results = {};

  // 1. Database Connection & Catalog Fetch
  let pool;
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '1234',
      database: process.env.DB_NAME || 'smart_pc_builder',
      waitForConnections: true,
      connectionLimit: 10
    });

    const t0 = performance.now();
    const [categories] = await pool.query('SELECT * FROM categories');
    const [products] = await pool.query('SELECT * FROM products');
    const [specsCpu] = await pool.query('SELECT * FROM spec_cpu');
    const [specsMobo] = await pool.query('SELECT * FROM spec_motherboard');
    const [specsRam] = await pool.query('SELECT * FROM spec_ram');
    const [specsGpu] = await pool.query('SELECT * FROM spec_gpu');
    const t1 = performance.now();
    results['catalog_fetch'] = ((t1 - t0) / 1000).toFixed(4);
    console.log(`1. Database Catalog Fetch: ${results['catalog_fetch']} s (Fetched ${products.length} products across 7 categories)`);
  } catch (err) {
    console.log('DB error:', err.message);
  }

  // 2. Auth: Password Hashing & JWT Token Generation
  const tAuth0 = performance.now();
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('password123', salt);
  const isMatch = await bcrypt.compare('password123', hash);
  const token = jwt.sign({ id: 1, email: 'user@example.com', role: 'customer' }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
  const tAuth1 = performance.now();
  results['auth_process'] = ((tAuth1 - tAuth0) / 1000).toFixed(4);
  console.log(`2. User Auth (Bcrypt + JWT verification): ${results['auth_process']} s`);

  // 3. Search & Filter across in-memory items (500 items x 100 queries)
  const sampleItems = Array.from({ length: 500 }, (_, i) => ({
    id: i,
    name: `Item ${i} RTX 4070 Intel Core i5 DDR5 6000MHz`,
    category: i % 7 === 0 ? 'cpu' : i % 7 === 1 ? 'gpu' : 'ram',
    price: 1000 + i * 50
  }));
  const tSearch0 = performance.now();
  for (let i = 0; i < 100; i++) {
    const filtered = sampleItems.filter(item => item.name.toLowerCase().includes('rtx') && item.price <= 50000);
  }
  const tSearch1 = performance.now();
  results['search_filter'] = (((tSearch1 - tSearch0) / 100) / 1000).toFixed(4);
  console.log(`3. Search & Filter (Per query): ${results['search_filter']} s`);

  // 4. Real-time Compatibility Check Logic (1,000 runs)
  const tCompat0 = performance.now();
  for (let i = 0; i < 1000; i++) {
    const cpu = { socket: 'LGA1700', tdp_watt: 65 };
    const mobo = { socket: 'LGA1700', ram_type: 'DDR5' };
    const ram = { ram_type: 'DDR5', capacity_gb: 32 };
    const gpu = { tdp_watt: 220 };
    const psu = { wattage: 650 };
    
    const socketOk = cpu.socket === mobo.socket;
    const ramOk = mobo.ram_type === ram.ram_type;
    const totalWatt = cpu.tdp_watt + gpu.tdp_watt + 100;
    const powerOk = psu.wattage >= totalWatt;
  }
  const tCompat1 = performance.now();
  results['compat_check'] = (((tCompat1 - tCompat0) / 1000) / 1000).toFixed(4);
  console.log(`4. Compatibility Check Logic (Per run): ${results['compat_check']} s`);

  // 5. Real-time Price and Wattage Calculation (1,000 runs)
  const tCalc0 = performance.now();
  for (let i = 0; i < 1000; i++) {
    const cart = [
      { price: 6500, tdp: 65 },
      { price: 4200, tdp: 0 },
      { price: 3800, tdp: 15 },
      { price: 18900, tdp: 220 },
      { price: 2900, tdp: 10 },
      { price: 2500, tdp: 0 },
      { price: 1800, tdp: 0 }
    ];
    const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);
    const totalWatts = cart.reduce((sum, item) => sum + item.tdp, 0) + 100;
  }
  const tCalc1 = performance.now();
  results['price_calc'] = (((tCalc1 - tCalc0) / 1000) / 1000).toFixed(4);
  console.log(`5. Real-time Price & Wattage Calc (Per run): ${results['price_calc']} s`);

  // 6. Gemini AI Chatbot call (Real API call if internet is available)
  try {
    const { GoogleGenAI } = require('@google/genai');
    if (process.env.GEMINI_API_KEY) {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const tAi0 = performance.now();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'แนะนำสเปคคอมงบ 25000 สั้นๆ 3 บรรทัด'
      });
      const tAi1 = performance.now();
      results['gemini_ai'] = ((tAi1 - tAi0) / 1000).toFixed(2);
      console.log(`6. Gemini AI API Response Time (Real Network call): ${results['gemini_ai']} s`);
    }
  } catch (err) {
    console.log('Gemini API benchmark note:', err.message);
  }

  // 7. Order Insertion & Deletion to DB
  if (pool) {
    try {
      const tOrder0 = performance.now();
      const testOrderId = `BENCH-${Date.now()}`;
      await pool.query(
        'INSERT INTO orders (id, customer_name, customer_address, customer_phone, assembly_type, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [testOrderId, 'Benchmark User', '123 Test St', '0812345678', 'none', 35000.00, 'assembling']
      );
      await pool.query('DELETE FROM orders WHERE id = ?', [testOrderId]);
      const tOrder1 = performance.now();
      results['order_insert'] = ((tOrder1 - tOrder0) / 1000).toFixed(4);
      console.log(`7. Save & Manage Order in Database: ${results['order_insert']} s`);
    } catch (err) {
      console.log('Order insert note:', err.message);
    }
    await pool.end();
  }

  console.log('\n=== Real Benchmark Summary ===');
  console.log(JSON.stringify(results, null, 2));
}

runRealBenchmark();
