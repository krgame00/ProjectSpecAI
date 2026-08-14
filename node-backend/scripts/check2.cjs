const mysql = require('mysql2/promise');
(async () => {
  const conn = await mysql.createConnection({host:'localhost',port:3306,user:'root',password:'1234',database:'smart_pc_builder'});
  // ราคาผิดปกติ
  const [bad] = await conn.query('SELECT model, price, product_url FROM products WHERE category_id=5 AND (price<=0 OR price>100000)');
  console.log('=== ราคาผิดปกติ ===');
  bad.forEach(b=>console.log('  ', b.model.slice(0,50), '| ฿'+b.price, '|', b.product_url?.slice(0,60)));
  // ไม่มี capacity/type
  const [ns] = await conn.query('SELECT p.model, p.price, s.type, s.capacity_gb FROM products p LEFT JOIN spec_storage s ON s.product_id=p.id WHERE p.category_id=5 AND (s.capacity_gb IS NULL OR s.type IS NULL) LIMIT 10');
  console.log('\n=== ไม่มี capacity/type (ตัวอย่าง 10) ===');
  ns.forEach(n=>console.log('  ', n.model.slice(0,50), '| ฿'+n.price, '| type:', n.type, '| cap:', n.capacity_gb));
  await conn.end();
})().catch(e=>{console.error('ERR',e.message);process.exit(1)});
