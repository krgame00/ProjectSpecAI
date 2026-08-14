const mysql = require('mysql2/promise');
(async () => {
  const conn = await mysql.createConnection({host:'localhost',port:3306,user:'root',password:'1234',database:'smart_pc_builder'});
  const [ns] = await conn.query(`SELECT p.model, p.price, s.type, s.capacity_gb 
    FROM products p LEFT JOIN spec_storage s ON s.product_id=p.id 
    WHERE p.category_id=5 AND (s.capacity_gb IS NULL OR s.type IS NULL) ORDER BY p.price DESC LIMIT 20`);
  console.log('=== ไม่มี capacity/type (เหลือ 14) ===');
  ns.forEach(n=>console.log('  ', n.model.slice(0,55), '| ฿'+n.price, '| type:', n.type, '| cap:', n.capacity_gb));
  await conn.end();
})().catch(e=>{console.error('ERR',e.message);process.exit(1)});
