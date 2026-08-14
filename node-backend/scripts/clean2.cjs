const mysql = require('mysql2/promise');
(async () => {
  const conn = await mysql.createConnection({host:'localhost',port:3306,user:'root',password:'1234',database:'smart_pc_builder'});
  const generic = [
    'SSD Solid State Drive เอสเอสดี อุปกรณ์จัดเก็บข้อมูล  Ad',
    'NAS SATA III HDD: ประสิทธิภาพสูง เสถียร ปลอดภัย สำหรับธ',
    'HDD NAS ฮาร์ดดิสก์เก็บข้อมูลระบบเครือข่าย  Advice - Adv'
  ];
  for (const g of generic) {
    const [del] = await conn.query('DELETE FROM products WHERE category_id=5 AND model LIKE ?', [g + '%']);
    console.log('ลบ', g.slice(0,40), ':', del.affectedRows);
  }
  // ลบ spec_storage orphaned
  const [delSpec] = await conn.query('DELETE s FROM spec_storage s LEFT JOIN products p ON p.id=s.product_id WHERE p.id IS NULL');
  console.log('ลบ spec orphaned:', delSpec.affectedRows);
  const [total] = await conn.query('SELECT COUNT(*) n FROM products WHERE category_id=5');
  console.log('\nStorage ทั้งหมด:', total[0].n, 'ตัว');
  const [advice] = await conn.query("SELECT COUNT(*) n FROM products WHERE category_id=5 AND specifications LIKE '%advice%'");
  console.log('จาก Advice:', advice[0].n, 'ตัว');
  const [nospec] = await conn.query('SELECT COUNT(*) n FROM products p LEFT JOIN spec_storage s ON s.product_id=p.id WHERE p.category_id=5 AND (s.capacity_gb IS NULL OR s.type IS NULL)');
  console.log('ยังไม่มี capacity/type:', nospec[0].n, 'ตัว (เหลือ NAS ล้วน)');
  await conn.end();
})().catch(e=>{console.error('ERR',e.message);process.exit(1)});
