const mysql = require('mysql2/promise');
(async () => {
  const conn = await mysql.createConnection({host:'localhost',port:3306,user:'root',password:'1234',database:'smart_pc_builder'});
  const [ns] = await conn.query(`SELECT p.model, p.price FROM products p LEFT JOIN spec_storage s ON s.product_id=p.id 
    WHERE p.category_id=5 AND (s.capacity_gb IS NULL OR s.type IS NULL) ORDER BY p.price DESC`);
  console.log('=== ไม่มี capacity (ควรเป็น NAS ล้วน) ===');
  ns.forEach(n=>console.log('  ', n.model.slice(0,55), '| ฿'+n.price));
  await conn.end();
})().catch(e=>{console.error('ERR',e.message);process.exit(1)});
