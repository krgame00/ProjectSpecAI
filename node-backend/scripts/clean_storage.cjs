const mysql = require('mysql2/promise');
(async () => {
  const conn = await mysql.createConnection({host:'localhost',port:3306,user:'root',password:'1234',database:'smart_pc_builder'});
  
  // ลบ "เลือกสินค้าเพื่อเปรียบเทียบ" (compare page)
  const [del1] = await conn.query("DELETE FROM products WHERE category_id=5 AND model='เลือกสินค้าเพื่อเปรียบเทียบ'");
  console.log('ลบ Compare page:', del1.affectedRows);
  
  // ลบ DVD trays (ODD accessory)
  const [del2] = await conn.query("DELETE FROM products WHERE category_id=5 AND model LIKE 'ถาด DVD%'");
  console.log('ลบ DVD trays:', del2.affectedRows);
  
  // ลบ Wireless USB Adapter (ไม่ใช่ storage)
  const [del3] = await conn.query("DELETE FROM products WHERE category_id=5 AND model LIKE '%Wireless USB Adapter%'");
  console.log('ลบ Wireless USB:', del3.affectedRows);
  
  // ลบหน้าหมวดทั่วไปที่ชื่อสั้นเกิน/ไม่มี capacity จริง
  const generic = [
    'Harddisk SSD',
    'Network Storage NAS',
    'HDD NAS ฮาร์ดดิสก์เก็บข้อมูลระบบเครือข่าย  Advice',
    'SSD สำหรับองค์กร ราคา',
    'NAS SATA III HDD: ประสิทธิภาพสูง เสถียร ปลอดภัย สำ'
  ];
  for (const name of generic) {
    const [del] = await conn.query('DELETE FROM products WHERE category_id=5 AND model=?', [name]);
    console.log(`ลบ ${name.slice(0,30)}:`, del.affectedRows);
  }
  
  // ลบ spec_storage ที่ orphaned (ไม่มี product)
  const [delSpec] = await conn.query('DELETE s FROM spec_storage s LEFT JOIN products p ON p.id=s.product_id WHERE p.id IS NULL');
  console.log('ลบ spec_storage orphaned:', delSpec.affectedRows);
  
  // ตรวจผล
  const [total] = await conn.query('SELECT COUNT(*) n FROM products WHERE category_id=5');
  console.log('\n=== Storage หลังทำความสะอาด:', total[0].n, 'ตัว ===');
  
  const [advice] = await conn.query("SELECT COUNT(*) n FROM products WHERE category_id=5 AND specifications LIKE '%advice%'");
  console.log('จาก Advice:', advice[0].n, 'ตัว');
  
  const [nospec] = await conn.query('SELECT COUNT(*) n FROM products p LEFT JOIN spec_storage s ON s.product_id=p.id WHERE p.category_id=5 AND (s.capacity_gb IS NULL OR s.type IS NULL)');
  console.log('ยังไม่มี capacity/type:', nospec[0].n, 'ตัว');
  
  await conn.end();
})().catch(e=>{console.error('ERR',e.message);process.exit(1)});
