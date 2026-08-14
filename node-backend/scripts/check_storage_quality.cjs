const mysql = require('mysql2/promise');
(async () => {
  const conn = await mysql.createConnection({host:'localhost',port:3306,user:'root',password:'1234',database:'smart_pc_builder'});
  const [total] = await conn.query('SELECT COUNT(*) n FROM products WHERE category_id=5');
  console.log('=== Storage ทั้งหมด:', total[0].n, 'ตัว ===');
  const [advice] = await conn.query("SELECT COUNT(*) n FROM products WHERE category_id=5 AND specifications LIKE '%advice%'");
  console.log('จาก Advice:', advice[0].n, 'ตัว');
  const [dups] = await conn.query('SELECT model, COUNT(*) c FROM products WHERE category_id=5 GROUP BY model HAVING c>1 ORDER BY c DESC LIMIT 5');
  console.log('=== ชื่อซ้ำ:', dups.length, 'กลุ่ม ===');
  dups.forEach(d=>console.log('  ', d.model.slice(0,50), 'x'+d.c));
  const [bad] = await conn.query('SELECT COUNT(*) n FROM products WHERE category_id=5 AND (price<=0 OR price>100000)');
  console.log('=== ราคาผิด (<=0 หรือ >100k):', bad[0].n, 'ตัว ===');
  const [short] = await conn.query('SELECT COUNT(*) n FROM products WHERE category_id=5 AND CHAR_LENGTH(model)<10');
  console.log('=== ชื่อสั้น <10 ตัวอักษร:', short[0].n, 'ตัว ===');
  const [nospec] = await conn.query('SELECT COUNT(*) n FROM products p LEFT JOIN spec_storage s ON s.product_id=p.id WHERE p.category_id=5 AND (s.capacity_gb IS NULL OR s.type IS NULL)');
  console.log('=== ไม่มี capacity/type:', nospec[0].n, 'ตัว ===');
  // ตัวอย่างข้อมูล Advice ล่าสุด
  const [samples] = await conn.query("SELECT model, price FROM products WHERE category_id=5 AND specifications LIKE '%advice%' ORDER BY id DESC LIMIT 5");
  console.log('\n=== ตัวอย่างล่าสุด (5) ===');
  samples.forEach(s=>console.log('  ', s.model.slice(0,55), '| ฿'+s.price));
  await conn.end();
})().catch(e=>{console.error('ERR',e.message);process.exit(1)});
