const fs = require('fs');
const filePath = 'C:/Users/PC/Downloads/pcspec_all_11_flowcharts (1).drawio';
const backupPath = 'C:/Users/PC/Downloads/pcspec_all_11_flowcharts (1)_backup.drawio';

// 1. Create backup
const originalContent = fs.readFileSync(filePath, 'utf8');
fs.writeFileSync(backupPath, originalContent, 'utf8');
console.log('Backup created at:', backupPath);

// 2. Define replacements mapping (Exact strings)
const replacements = [
  // Diagram 1: สมัครสมาชิก
  { from: 'ส่ง API POST /api/auth/register', to: 'ส่งข้อมูลสมัครสมาชิกไปยังเซิร์ฟเวอร์' },
  { from: 'เข้ารหัสผ่านด้วย bcrypt', to: 'เข้ารหัสความปลอดภัยของรหัสผ่าน' },
  { from: 'บันทึกข้อมูลลงตาราง users', to: 'บันทึกข้อมูลผู้ใช้ลงฐานข้อมูล' },
  
  // Diagram 2: เข้าสู่ระบบ
  { from: 'ส่ง API POST /api/auth/login', to: 'ส่งข้อมูลเข้าสู่ระบบไปยังเซิร์ฟเวอร์' },
  { from: 'สร้าง JWT Token &amp; ดึง Role', to: 'สร้างสิทธิ์การใช้งาน (Token &amp; Role)' },
  { from: 'สร้าง JWT Token & ดึง Role', to: 'สร้างสิทธิ์การใช้งาน (Token & Role)' },
  { from: 'บันทึกลง localStorage/Pinia', to: 'บันทึกข้อมูลการเข้าสู่ระบบในเบราว์เซอร์' },
  { from: 'ไปหน้า Admin (/admin)', to: 'เข้าสู่หน้าผู้ดูแลระบบ (Admin)' },
  { from: 'ไปหน้า Builder (/build)', to: 'เข้าสู่หน้าจัดสเปคคอมพิวเตอร์' },
  { from: 'value="Customer"', to: 'value="ผู้ใช้งานทั่วไป"' },
  { from: 'value="Admin"', to: 'value="ผู้ดูแลระบบ"' },
  
  // Diagram 3: จัดสเปคด้วยตนเอง
  { from: 'เพิ่มอุปกรณ์ลง Builder Store', to: 'เพิ่มอุปกรณ์ลงในรายการจัดสเปค' },
  { from: 'เรียกตรวจความเข้ากันได้&lt;div&gt;/ความสอดคล้องกันของอุปกรณ์&lt;/div&gt;', to: 'ตรวจสอบความเข้ากันได้ของอุปกรณ์' },
  { from: 'เรียกตรวจความเข้ากันได้<div>/ความสอดคล้องกันของอุปกรณ์</div>', to: 'ตรวจสอบความเข้ากันได้ของอุปกรณ์' },

  // Diagram 4: ใช้ระบบ SpecAI ช่วยจัดสเปค
  { from: 'ส่ง POST /api/chatbot/generate-spec', to: 'ส่งงบประมาณและความต้องการให้ระบบประมวลผล' },
  { from: 'Backend ดึงสินค้าจาก MySQL', to: 'ดึงรายการสินค้าจากฐานข้อมูล' },
  { from: 'ส่ง Prompt ให้ Gemini AI จัดสเปค', to: 'ส่งข้อมูลให้ AI ประมวลผลและจัดสเปค' },
  { from: 'แสดงสเปคคอมจัดโดย AI (JSON)', to: 'แสดงชุดสเปคคอมพิวเตอร์ที่ AI แนะนำ' },
  { from: 'นำสเปคเข้า Builder Store อัตโนมัติ', to: 'นำชุดสเปคลงในรายการจัดสเปคอัตโนมัติ' },

  // Diagram 5: ใช้แชตบอทถามข้อมูลเกี่ยวกับคอม
  { from: 'ส่ง POST /api/chatbot/message', to: 'ส่งคำถามไปยังระบบประมวลผล' },
  { from: 'Backend แนบ Context สินค้าจาก DB', to: 'ดึงข้อมูลสินค้าที่เกี่ยวข้องประกอบคำตอบ' },
  { from: 'ส่งคำถาม + Context ให้ Gemini', to: 'ส่งคำถามและข้อมูลสินค้าให้ AI วิเคราะห์' },

  // Diagram 6: เพิ่มข้อมูลอุปกรณ์
  { from: 'ตรวจสอบสิทธิ์ Admin', to: 'ตรวจสอบสิทธิ์ผู้ดูแลระบบ' },
  { from: 'แสดงเตือน: ปฏิเสธการเข้าถึง', to: 'แสดงข้อความ: ไม่มีสิทธิ์เข้าถึง' },
  { from: 'กรอกชื่อ, หมวดหมู่, ราคา, TDP', to: 'กรอกข้อมูลอุปกรณ์ เช่น ชื่อ หมวดหมู่ ราคา สเปค' },
  { from: 'อัปโหลดภาพไปที่ /api/upload', to: 'อัปโหลดรูปภาพขึ้นระบบ' },
  { from: 'ใช้ Path รูปภาพตั้งต้น', to: 'ใช้รูปภาพเริ่มต้นของระบบ' },
  { from: 'บันทึกคำขอ POST /api/hardware', to: 'บันทึกข้อมูลอุปกรณ์ใหม่ลงฐานข้อมูล' },
  { from: 'value="เป็น Admin"', to: 'value="เป็นผู้ดูแลระบบ"' },
  { from: 'value="ไม่ใช่ Admin"', to: 'value="ไม่ใช่ผู้ดูแลระบบ"' },

  // Diagram 7: แก้ไขข้อมูลอุปกรณ์
  { from: 'ส่ง API PUT /api/hardware/:id', to: 'บันทึกการแก้ไขข้อมูลลงฐานข้อมูล' },
  { from: 'ส่ง API DELETE /api/hardware/:id', to: 'ลบข้อมูลอุปกรณ์ออกจากฐานข้อมูล' },
  { from: 'อัปเดตตารางสินค้าล่าสุด', to: 'แสดงรายการอุปกรณ์ล่าสุด' },

  // Diagram 8: ระบบบทความ
  { from: 'ผู้ใช้เข้าสู่หน้าบทความ /articles', to: 'เข้าสู่หน้ารวมบทความและข่าวสารไอที' },
  { from: 'ส่ง API GET /api/articles', to: 'ดึงรายการบทความทั้งหมดจากฐานข้อมูล' },
  { from: 'ส่ง API GET /api/articles/:id', to: 'ดึงเนื้อหาบทความฉบับเต็มจากฐานข้อมูล' },

  // Diagram 9: ระบบสั่งซื้อ
  { from: 'กดปุ่มสั่งซื้อสินค้า (Checkout)', to: 'กดยืนยันการสั่งซื้อสินค้า' },
  { from: 'ส่ง API POST /api/orders', to: 'ส่งข้อมูลคำสั่งซื้อไปยังเซิร์ฟเวอร์' },
  { from: 'บันทึกคำสั่งซื้อลงตาราง orders', to: 'บันทึกรายการคำสั่งซื้อลงฐานข้อมูล' },
  { from: 'แสดงสั่งซื้อสำเร็จ พร้อม Order ID', to: 'แสดงสั่งซื้อสำเร็จ พร้อมรหัสคำสั่งซื้อ' },

  // Diagram 10: ระบบพิมพ์เอกสารสเปคคอม
  { from: 'ดูรายการสเปคคอมในหน้า Builder', to: 'เปิดดูรายการสเปคคอมพิวเตอร์ที่จัดไว้' },
  { from: 'กดปุ่มพิมพ์เอกสาร / Export PDF', to: 'กดปุ่มพิมพ์ใบเสนอราคา / บันทึก PDF' },
  { from: 'สร้างโครงร่างใบเสนอราคา Spec Sheet', to: 'สร้างรูปแบบเอกสารใบเสนอราคา (Spec Sheet)' },
  { from: 'เรียกใช้คำสั่ง window.print()', to: 'เปิดหน้าต่างคำสั่งพิมพ์เอกสารของระบบ' },
  { from: 'พิมพ์เอกสารหรือบันทึกไฟล์ PDF', to: 'สั่งพิมพ์เอกสารหรือบันทึกเป็นไฟล์ PDF' },

  // Diagram 11: ระบบตรวจความเข้ากันได้
  { from: 'เฝ้าติดตาม Builder Store Real-time', to: 'ตรวจจับการเลือกอุปกรณ์ในรายการจัดสเปค' },
  { from: '1. ตรวจ Socket CPU&amp;nbsp;&lt;div&gt;กับ Mainboard&lt;/div&gt;', to: '1. ตรวจสอบ Socket CPU&lt;div&gt;ตรงกับ Mainboard หรือไม่&lt;/div&gt;' },
  { from: '1. ตรวจ Socket CPU&nbsp;<div>กับ Mainboard</div>', to: '1. ตรวจสอบ Socket CPU<div>ตรงกับ Mainboard หรือไม่</div>' },
  { from: '2. ตรวจ RAM Type&amp;nbsp;&lt;div&gt;กับ Mainboard&lt;/div&gt;', to: '2. ตรวจสอบประเภท RAM&lt;div&gt;ตรงกับ Mainboard หรือไม่&lt;/div&gt;' },
  { from: '2. ตรวจ RAM Type&nbsp;<div>กับ Mainboard</div>', to: '2. ตรวจสอบประเภท RAM<div>ตรงกับ Mainboard หรือไม่</div>' },
  { from: '3. คำนวณ TDP รวม&lt;div&gt;กับ PSU Watt&lt;/div&gt;', to: '3. ตรวจสอบกำลังไฟ PSU&lt;div&gt;เพียงพอกับอุปกรณ์ทั้งหมดหรือไม่&lt;/div&gt;' },
  { from: '3. คำนวณ TDP รวม<div>กับ PSU Watt</div>', to: '3. ตรวจสอบกำลังไฟ PSU<div>เพียงพอกับอุปกรณ์ทั้งหมดหรือไม่</div>' },
  { from: 'บันทึกเตือน: Socket ไม่ตรงกัน', to: 'แจ้งเตือน: Socket CPU ไม่ตรงกับบอร์ด' },
  { from: 'บันทึกเตือน: RAM Type ไม่รองรับ', to: 'แจ้งเตือน: เมนบอร์ดไม่รองรับ RAM ชนิดนี้' },
  { from: 'บันทึกเตือน: PSU Watt ไม่พอ', to: 'แจ้งเตือน: กำลังไฟพาวเวอร์ซัพพลายไม่เพียงพอ' },
  { from: 'แสดงแถบเขียว: เข้ากันได้ 100%', to: 'แสดงผล: อุปกรณ์ทุกชิ้นเข้ากันได้สมบูรณ์' },
  { from: 'แสดงแถบเตือนสีแดง/ส้ม พร้อมวิธีแก้', to: 'แสดงผล: พบอุปกรณ์ที่ไม่เข้ากัน พร้อมวิธีแก้ไข' }
];

let updatedContent = originalContent;
let changeCount = 0;

replacements.forEach(({ from, to }) => {
  if (updatedContent.includes(from)) {
    const count = updatedContent.split(from).length - 1;
    updatedContent = updatedContent.replaceAll(from, to);
    console.log(`Replaced [${from}] -> [${to}] (${count} times)`);
    changeCount += count;
  }
});

fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log(`\nSuccessfully updated file with ${changeCount} replacements.`);
