const fs = require('fs');
const path = require('path');

const drawioDir = path.join(__dirname, '..', 'docs', 'drawio');
if (!fs.existsSync(drawioDir)) {
  fs.mkdirSync(drawioDir, { recursive: true });
}

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateDrawioXml(title, nodes, connections) {
  const boxWidth = 260;
  const boxHeight = 54;
  const diamondWidth = 220;
  const diamondHeight = 90;
  const paddingY = 60;
  const startX = 350;
  const startY = 80;

  const positions = {};
  let currentY = startY;

  nodes.forEach((node) => {
    let w = boxWidth;
    let h = boxHeight;
    if (node.type === 'decision') {
      w = diamondWidth;
      h = diamondHeight;
    } else if (node.type === 'start' || node.type === 'end') {
      w = 160;
      h = 44;
    }

    let col = node.col || 0;
    let x = startX + col * 320;

    positions[node.id] = {
      id: node.id,
      type: node.type,
      text: node.text,
      x: x,
      y: currentY,
      w: w,
      h: h
    };

    currentY += h + paddingY;
  });

  let cellsXml = `        <mxCell id="0" />\n        <mxCell id="1" parent="0" />\n`;

  // Header Title in Clean Academic Black
  cellsXml += `        <mxCell id="header_title" value="${escapeXml(title)}" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=18;fontStyle=1;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="100" y="20" width="660" height="40" as="geometry" />
        </mxCell>\n`;

  // Draw Nodes - BLACK & WHITE MONOCHROME STYLES
  nodes.forEach(node => {
    const pos = positions[node.id];
    let style = '';
    const txt = escapeXml(node.text);

    if (node.type === 'start' || node.type === 'end') {
      // Oval: Black stroke (2px), White fill, Black text (Bold)
      style = 'ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=2;fontColor=#000000;fontStyle=1;fontSize=14;align=center;';
    } else if (node.type === 'decision') {
      // Diamond: Black stroke (2px), White fill, Black text (Bold)
      style = 'rhombus;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=2;fontColor=#000000;fontStyle=1;fontSize=13;align=center;';
    } else if (node.type === 'input') {
      // Parallelogram: Black stroke (1.5px), White fill, Black text
      style = 'shape=parallelogram;perimeter=parallelogramPerimeter;whiteSpace=wrap;html=1;fixedSize=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;fontSize=13;align=center;';
    } else {
      // Rectangle (Process): Black stroke (1.5px), White fill, Black text
      style = 'rounded=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;fontSize=13;align=center;';
    }

    cellsXml += `        <mxCell id="${node.id}" value="${txt}" style="${style}" vertex="1" parent="1">
          <mxGeometry x="${pos.x - pos.w / 2}" y="${pos.y}" width="${pos.w}" height="${pos.h}" as="geometry" />
        </mxCell>\n`;
  });

  // Connections - Black lines with White label background & Black border
  connections.forEach((conn, idx) => {
    const from = positions[conn.from];
    const to = positions[conn.to];
    if (!from || !to) return;

    const lbl = conn.label ? escapeXml(conn.label) : '';
    let exitX = 0.5;
    let exitY = 1;
    let entryX = 0.5;
    let entryY = 0;

    if (from.type === 'decision' && conn.exit === 'right') {
      exitX = 1;   // STRICT RIGHT VERTEX OF RHOMBUS
      exitY = 0.5;
    } else if (from.type === 'decision') {
      exitX = 0.5; // STRICT BOTTOM VERTEX OF RHOMBUS
      exitY = 1;
    }

    if (conn.entry === 'right') {
      entryX = 1;
      entryY = 0.5;
    } else if (conn.entry === 'top') {
      entryX = 0.5;
      entryY = 0;
    }

    const style = `edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;fontSize=12;fontStyle=1;labelBackgroundColor=#ffffff;labelBorderColor=#000000;exitX=${exitX};exitY=${exitY};exitPerimeter=1;entryX=${entryX};entryY=${entryY};entryPerimeter=1;`;

    cellsXml += `        <mxCell id="edge_${idx + 1}" value="${lbl}" style="${style}" edge="1" parent="1" source="${conn.from}" target="${conn.to}">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>\n`;
  });

  const xmlContent = `<mxfile host="Electron" modified="${new Date().toISOString()}" agent="PCSpec Generator" version="21.0.0" type="device">
  <diagram id="diagram_1" name="${escapeXml(title)}">
    <mxGraphModel dx="1200" dy="1200" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="1654" math="0" shadow="0">
      <root>
${cellsXml}      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

  return xmlContent;
}

// ALL 11 FLOWCHARTS DEFINITION
const flowcharts = [
  {
    filename: '1_register.drawio',
    title: '1. สมัครสมาชิก (User Registration)',
    nodes: [
      { id: 'start', type: 'start', text: 'เริ่มต้น' },
      { id: 'input', type: 'input', text: 'กรอกข้อมูลสมัครสมาชิก' },
      { id: 'val_client', type: 'decision', text: 'ตรวจความถูกต้องบนหน้าเว็บ' },
      { id: 'err_client', type: 'input', text: 'แสดงแจ้งเตือนข้อมูลไม่ถูกต้อง', col: 1 },
      { id: 'send_api', type: 'process', text: 'ส่ง API POST /api/auth/register' },
      { id: 'check_db', type: 'decision', text: 'ตรวจอีเมลซ้ำใน MySQL' },
      { id: 'err_db', type: 'input', text: 'แสดงแจ้งเตือนอีเมลนี้ถูกใช้แล้ว', col: 1 },
      { id: 'hash_pwd', type: 'process', text: 'เข้ารหัสผ่านด้วย bcrypt' },
      { id: 'save_db', type: 'process', text: 'บันทึกข้อมูลลงตาราง users' },
      { id: 'success', type: 'input', text: 'แสดงข้อความ สมัครสมาชิกสำเร็จ' },
      { id: 'redirect', type: 'process', text: 'นำไปยังหน้าเข้าสู่ระบบ (Login)' },
      { id: 'end', type: 'end', text: 'จบการทำงาน' }
    ],
    connections: [
      { from: 'start', to: 'input' },
      { from: 'input', to: 'val_client' },
      { from: 'val_client', to: 'send_api', exit: 'bottom', label: 'ถูกต้อง' },
      { from: 'val_client', to: 'err_client', exit: 'right', entry: 'top', label: 'ไม่ถูกต้อง' },
      { from: 'err_client', to: 'input', entry: 'right' },
      { from: 'send_api', to: 'check_db' },
      { from: 'check_db', to: 'hash_pwd', exit: 'bottom', label: 'ไม่ซ้ำ' },
      { from: 'check_db', to: 'err_db', exit: 'right', entry: 'top', label: 'อีเมลซ้ำ' },
      { from: 'err_db', to: 'input', entry: 'right' },
      { from: 'hash_pwd', to: 'save_db' },
      { from: 'save_db', to: 'success' },
      { from: 'success', to: 'redirect' },
      { from: 'redirect', to: 'end' }
    ]
  },
  {
    filename: '2_login.drawio',
    title: '2. เข้าสู่ระบบ (User Login & JWT Auth)',
    nodes: [
      { id: 'start', type: 'start', text: 'เริ่มต้น' },
      { id: 'input', type: 'input', text: 'กรอก อีเมล และ รหัสผ่าน' },
      { id: 'send_api', type: 'process', text: 'ส่ง API POST /api/auth/login' },
      { id: 'verify', type: 'decision', text: 'ตรวจสอบข้อมูลในฐานข้อมูล' },
      { id: 'err_login', type: 'input', text: 'แสดงเตือนอีเมล/รหัสผ่านผิด', col: 1 },
      { id: 'gen_token', type: 'process', text: 'สร้าง JWT Token & ดึง Role' },
      { id: 'save_store', type: 'process', text: 'บันทึกลง localStorage/Pinia' },
      { id: 'check_role', type: 'decision', text: 'ตรวจสอบสิทธิ์ Role' },
      { id: 'go_admin', type: 'process', text: 'ไปหน้า Admin (/admin)', col: 1 },
      { id: 'go_build', type: 'process', text: 'ไปหน้า Builder (/build)' },
      { id: 'end', type: 'end', text: 'จบการทำงาน' }
    ],
    connections: [
      { from: 'start', to: 'input' },
      { from: 'input', to: 'send_api' },
      { from: 'send_api', to: 'verify' },
      { from: 'verify', to: 'gen_token', exit: 'bottom', label: 'ถูกต้อง' },
      { from: 'verify', to: 'err_login', exit: 'right', entry: 'top', label: 'ไม่ถูกต้อง' },
      { from: 'err_login', to: 'input', entry: 'right' },
      { from: 'gen_token', to: 'save_store' },
      { from: 'save_store', to: 'check_role' },
      { from: 'check_role', to: 'go_build', exit: 'bottom', label: 'Customer' },
      { from: 'check_role', to: 'go_admin', exit: 'right', entry: 'top', label: 'Admin' },
      { from: 'go_build', to: 'end' },
      { from: 'go_admin', to: 'end' }
    ]
  },
  {
    filename: '3_builder.drawio',
    title: '3. จัดสเปคด้วยตนเอง (Manual PC Builder)',
    nodes: [
      { id: 'start', type: 'start', text: 'เริ่มต้น' },
      { id: 'fetch', type: 'process', text: 'ดึงแคตตาล็อกอุปกรณ์จาก MySQL' },
      { id: 'show_ui', type: 'input', text: 'แสดงหน้าจัดสเปค 8 หมวดหมู่' },
      { id: 'select_cat', type: 'input', text: 'เลือกหมวดหมู่อุปกรณ์' },
      { id: 'select_item', type: 'input', text: 'คลิกเลือกอุปกรณ์เข้าสเปค' },
      { id: 'add_store', type: 'process', text: 'เพิ่มอุปกรณ์ลง Builder Store' },
      { id: 'calc_watts', type: 'process', text: 'คำนวณราคารวม & Wattage รวม' },
      { id: 'check_compat', type: 'process', text: 'เรียกตรวจความเข้ากันได้' },
      { id: 'user_action', type: 'decision', text: 'ต้องการจัดอุปกรณ์เพิ่มหรือไม่?' },
      { id: 'show_done', type: 'input', text: 'แสดงสเปคคอมพิวเตอร์สมบูรณ์' },
      { id: 'end', type: 'end', text: 'จบการทำงาน' }
    ],
    connections: [
      { from: 'start', to: 'fetch' },
      { from: 'fetch', to: 'show_ui' },
      { from: 'show_ui', to: 'select_cat' },
      { from: 'select_cat', to: 'select_item' },
      { from: 'select_item', to: 'add_store' },
      { from: 'add_store', to: 'calc_watts' },
      { from: 'calc_watts', to: 'check_compat' },
      { from: 'check_compat', to: 'user_action' },
      { from: 'user_action', to: 'show_done', exit: 'bottom', label: 'เสร็จสิ้น' },
      { from: 'user_action', to: 'select_cat', exit: 'right', label: 'จัดเพิ่ม' },
      { from: 'show_done', to: 'end' }
    ]
  },
  {
    filename: '4_specai.drawio',
    title: '4. ใช้ระบบ SpecAI ช่วยจัดสเปค (AI Spec Generator)',
    nodes: [
      { id: 'start', type: 'start', text: 'เริ่มต้น' },
      { id: 'open_ui', type: 'input', text: 'เปิดหน้าต่าง SpecAI' },
      { id: 'input_crit', type: 'input', text: 'ระบุงบประมาณ & วัตถุประสงค์' },
      { id: 'send_api', type: 'process', text: 'ส่ง POST /api/chatbot/generate-spec' },
      { id: 'fetch_db', type: 'process', text: 'Backend ดึงสินค้าจาก MySQL' },
      { id: 'call_gemini', type: 'process', text: 'ส่ง Prompt ให้ Gemini AI จัดสเปค' },
      { id: 'show_result', type: 'input', text: 'แสดงสเปคคอมจัดโดย AI (JSON)' },
      { id: 'confirm', type: 'decision', text: 'พึงพอใจสเปคนี้หรือไม่?' },
      { id: 'apply_store', type: 'process', text: 'นำสเปคเข้า Builder Store อัตโนมัติ' },
      { id: 'end', type: 'end', text: 'จบการทำงาน' }
    ],
    connections: [
      { from: 'start', to: 'open_ui' },
      { from: 'open_ui', to: 'input_crit' },
      { from: 'input_crit', to: 'send_api' },
      { from: 'send_api', to: 'fetch_db' },
      { from: 'fetch_db', to: 'call_gemini' },
      { from: 'call_gemini', to: 'show_result' },
      { from: 'show_result', to: 'confirm' },
      { from: 'confirm', to: 'apply_store', exit: 'bottom', label: 'พึงพอใจ' },
      { from: 'confirm', to: 'input_crit', exit: 'right', label: 'ไม่พึงพอใจ' },
      { from: 'apply_store', to: 'end' }
    ]
  },
  {
    filename: '5_chatbot.drawio',
    title: '5. ใช้แชตบอทถามข้อมูลเกี่ยวกับคอม (AI Hardware Chatbot)',
    nodes: [
      { id: 'start', type: 'start', text: 'เริ่มต้น' },
      { id: 'open_chat', type: 'input', text: 'เปิดหน้าต่าง AI Chatbot' },
      { id: 'input_q', type: 'input', text: 'พิมพ์คำถามเกี่ยวกับคอมพิวเตอร์' },
      { id: 'send_api', type: 'process', text: 'ส่ง POST /api/chatbot/message' },
      { id: 'attach_ctx', type: 'process', text: 'Backend แนบ Context สินค้าจาก DB' },
      { id: 'gemini_proc', type: 'process', text: 'ส่งคำถาม + Context ให้ Gemini' },
      { id: 'show_ans', type: 'input', text: 'แสดงข้อความคำตอบบนหน้าต่างแชต' },
      { id: 'ask_more', type: 'decision', text: 'ต้องการถามเพิ่มเติมหรือไม่?' },
      { id: 'end', type: 'end', text: 'จบการทำงาน' }
    ],
    connections: [
      { from: 'start', to: 'open_chat' },
      { from: 'open_chat', to: 'input_q' },
      { from: 'input_q', to: 'send_api' },
      { from: 'send_api', to: 'attach_ctx' },
      { from: 'attach_ctx', to: 'gemini_proc' },
      { from: 'gemini_proc', to: 'show_ans' },
      { from: 'show_ans', to: 'ask_more' },
      { from: 'ask_more', to: 'end', exit: 'bottom', label: 'ปิดแชต' },
      { from: 'ask_more', to: 'input_q', exit: 'right', label: 'ถามเพิ่ม' }
    ]
  },
  {
    filename: '6_admin_add.drawio',
    title: '6. ระบบเพิ่มข้อมูลอุปกรณ์ (Admin Add Hardware)',
    nodes: [
      { id: 'start', type: 'start', text: 'เริ่มต้น' },
      { id: 'check_admin', type: 'decision', text: 'ตรวจสอบสิทธิ์ Admin' },
      { id: 'denied', type: 'input', text: 'แสดงเตือน: ปฏิเสธการเข้าถึง', col: 1 },
      { id: 'show_form', type: 'input', text: 'แสดงฟอร์มเพิ่มข้อมูลอุปกรณ์' },
      { id: 'input_data', type: 'input', text: 'กรอกชื่อ, หมวดหมู่, ราคา, TDP' },
      { id: 'has_img', type: 'decision', text: 'มีการอัปโหลดรูปภาพหรือไม่?' },
      { id: 'upload_file', type: 'process', text: 'อัปโหลดภาพไปที่ /api/upload', col: 1 },
      { id: 'default_img', type: 'process', text: 'ใช้ Path รูปภาพตั้งต้น' },
      { id: 'save_db', type: 'process', text: 'บันทึกคำขอ POST /api/hardware' },
      { id: 'show_success', type: 'input', text: 'แสดงข้อความ เพิ่มอุปกรณ์สำเร็จ' },
      { id: 'end', type: 'end', text: 'จบการทำงาน' }
    ],
    connections: [
      { from: 'start', to: 'check_admin' },
      { from: 'check_admin', to: 'show_form', exit: 'bottom', label: 'เป็น Admin' },
      { from: 'check_admin', to: 'denied', exit: 'right', label: 'ไม่ใช่ Admin' },
      { from: 'show_form', to: 'input_data' },
      { from: 'input_data', to: 'has_img' },
      { from: 'has_img', to: 'default_img', exit: 'bottom', label: 'ไม่มีรูป' },
      { from: 'has_img', to: 'upload_file', exit: 'right', label: 'มีรูปภาพ' },
      { from: 'upload_file', to: 'save_db' },
      { from: 'default_img', to: 'save_db' },
      { from: 'save_db', to: 'show_success' },
      { from: 'show_success', to: 'end' },
      { from: 'denied', to: 'end' }
    ]
  },
  {
    filename: '7_admin_edit.drawio',
    title: '7. ระบบแก้ไขข้อมูลอุปกรณ์ (Admin Edit & Delete Hardware)',
    nodes: [
      { id: 'start', type: 'start', text: 'เริ่มต้น' },
      { id: 'check_admin', type: 'decision', text: 'ตรวจสอบสิทธิ์ Admin' },
      { id: 'denied', type: 'input', text: 'แสดงเตือน: ปฏิเสธการเข้าถึง', col: 1 },
      { id: 'show_list', type: 'input', text: 'แสดงรายการฮาร์ดแวร์ทั้งหมด' },
      { id: 'choose_act', type: 'decision', text: 'เลือกคำสั่งการทำงาน' },
      { id: 'edit_form', type: 'input', text: 'กรอกข้อมูลแก้ไขในฟอร์ม' },
      { id: 'send_put', type: 'process', text: 'ส่ง API PUT /api/hardware/:id' },
      { id: 'confirm_del', type: 'decision', text: 'ยืนยันการลบสินค้า?', col: 1 },
      { id: 'send_del', type: 'process', text: 'ส่ง API DELETE /api/hardware/:id', col: 1 },
      { id: 'refresh', type: 'process', text: 'อัปเดตตารางสินค้าล่าสุด' },
      { id: 'end', type: 'end', text: 'จบการทำงาน' }
    ],
    connections: [
      { from: 'start', to: 'check_admin' },
      { from: 'check_admin', to: 'show_list', exit: 'bottom', label: 'เป็น Admin' },
      { from: 'check_admin', to: 'denied', exit: 'right', label: 'ไม่ใช่ Admin' },
      { from: 'show_list', to: 'choose_act' },
      { from: 'choose_act', to: 'edit_form', exit: 'bottom', label: 'แก้ไขข้อมูล' },
      { from: 'choose_act', to: 'confirm_del', exit: 'right', label: 'ลบอุปกรณ์' },
      { from: 'edit_form', to: 'send_put' },
      { from: 'send_put', to: 'refresh' },
      { from: 'confirm_del', to: 'send_del', exit: 'bottom', label: 'ยืนยัน' },
      { from: 'confirm_del', to: 'show_list', exit: 'right', label: 'ยกเลิก' },
      { from: 'send_del', to: 'refresh' },
      { from: 'refresh', to: 'end' },
      { from: 'denied', to: 'end' }
    ]
  },
  {
    filename: '8_articles.drawio',
    title: '8. ระบบบทความ (Articles & Tech News)',
    nodes: [
      { id: 'start', type: 'start', text: 'เริ่มต้น' },
      { id: 'nav_page', type: 'process', text: 'ผู้ใช้เข้าสู่หน้าบทความ /articles' },
      { id: 'fetch_list', type: 'process', text: 'ส่ง API GET /api/articles' },
      { id: 'show_cards', type: 'input', text: 'แสดงรายการการ์ดข่าวสารไอที' },
      { id: 'select_art', type: 'input', text: 'คลิกเลือกบทความที่สนใจ' },
      { id: 'fetch_detail', type: 'process', text: 'ส่ง API GET /api/articles/:id' },
      { id: 'show_content', type: 'input', text: 'แสดงเนื้อหาบทความแบบเต็ม' },
      { id: 'end', type: 'end', text: 'จบการทำงาน' }
    ],
    connections: [
      { from: 'start', to: 'nav_page' },
      { from: 'nav_page', to: 'fetch_list' },
      { from: 'fetch_list', to: 'show_cards' },
      { from: 'show_cards', to: 'select_art' },
      { from: 'select_art', to: 'fetch_detail' },
      { from: 'fetch_detail', to: 'show_content' },
      { from: 'show_content', to: 'end' }
    ]
  },
  {
    filename: '9_checkout.drawio',
    title: '9. ระบบสั่งซื้อ (Order & Checkout System)',
    nodes: [
      { id: 'start', type: 'start', text: 'เริ่มต้น' },
      { id: 'review_cart', type: 'input', text: 'ตรวจสอบรายการสินค้าในสเปค' },
      { id: 'check_empty', type: 'decision', text: 'มีรายการสินค้าหรือไม่?' },
      { id: 'warn_empty', type: 'input', text: 'แสดงเตือน: โปรดเลือกสินค้าก่อน', col: 1 },
      { id: 'click_checkout', type: 'input', text: 'กดปุ่มสั่งซื้อสินค้า (Checkout)' },
      { id: 'check_auth', type: 'decision', text: 'เข้าสู่ระบบ (Login) หรือยัง?' },
      { id: 'open_login', type: 'input', text: 'แสดงหน้าต่างเข้าสู่ระบบก่อน', col: 1 },
      { id: 'fill_form', type: 'input', text: 'กรอกที่อยู่จัดส่ง & วิธีชำระเงิน' },
      { id: 'send_order', type: 'process', text: 'ส่ง API POST /api/orders' },
      { id: 'save_db', type: 'process', text: 'บันทึกคำสั่งซื้อลงตาราง orders' },
      { id: 'clear_cart', type: 'process', text: 'ล้างข้อมูลสเปคในตะกร้า' },
      { id: 'show_success', type: 'input', text: 'แสดงสั่งซื้อสำเร็จ พร้อม Order ID' },
      { id: 'end', type: 'end', text: 'จบการทำงาน' }
    ],
    connections: [
      { from: 'start', to: 'review_cart' },
      { from: 'review_cart', to: 'check_empty' },
      { from: 'check_empty', to: 'click_checkout', exit: 'bottom', label: 'มีสินค้า' },
      { from: 'check_empty', to: 'warn_empty', exit: 'right', label: 'ไม่มีสินค้า' },
      { from: 'click_checkout', to: 'check_auth' },
      { from: 'check_auth', to: 'fill_form', exit: 'bottom', label: 'เข้าสู่ระบบแล้ว' },
      { from: 'check_auth', to: 'open_login', exit: 'right', label: 'ยังไม่เข้าสู่ระบบ' },
      { from: 'open_login', to: 'check_auth' },
      { from: 'fill_form', to: 'send_order' },
      { from: 'send_order', to: 'save_db' },
      { from: 'save_db', to: 'clear_cart' },
      { from: 'clear_cart', to: 'show_success' },
      { from: 'show_success', to: 'end' },
      { from: 'warn_empty', to: 'end' }
    ]
  },
  {
    filename: '10_print_pdf.drawio',
    title: '10. ระบบพิมพ์เอกสารสเปคคอม (Export / Print PDF)',
    nodes: [
      { id: 'start', type: 'start', text: 'เริ่มต้น' },
      { id: 'view_spec', type: 'input', text: 'ดูรายการสเปคคอมในหน้า Builder' },
      { id: 'click_print', type: 'input', text: 'กดปุ่มพิมพ์เอกสาร / Export PDF' },
      { id: 'gen_layout', type: 'process', text: 'สร้างโครงร่างใบเสนอราคา Spec Sheet' },
      { id: 'trigger_print', type: 'process', text: 'เรียกใช้คำสั่ง window.print()' },
      { id: 'print_dialog', type: 'decision', text: 'คำสั่งในหน้าต่างการพิมพ์' },
      { id: 'do_print', type: 'process', text: 'พิมพ์เอกสารหรือบันทึกไฟล์ PDF' },
      { id: 'end', type: 'end', text: 'จบการทำงาน' }
    ],
    connections: [
      { from: 'start', to: 'view_spec' },
      { from: 'view_spec', to: 'click_print' },
      { from: 'click_print', to: 'gen_layout' },
      { from: 'gen_layout', to: 'trigger_print' },
      { from: 'trigger_print', to: 'print_dialog' },
      { from: 'print_dialog', to: 'do_print', exit: 'bottom', label: 'พิมพ์ / Save PDF' },
      { from: 'print_dialog', to: 'view_spec', exit: 'right', label: 'ยกเลิก' },
      { from: 'do_print', to: 'end' }
    ]
  },
  {
    filename: '11_compatibility.drawio',
    title: '11. ระบบตรวจความเข้ากันได้ของอุปกรณ์ (Hardware Compatibility Check)',
    nodes: [
      { id: 'start', type: 'start', text: 'เริ่มต้น' },
      { id: 'monitor', type: 'process', text: 'เฝ้าติดตาม Builder Store Real-time' },
      { id: 'event', type: 'input', text: 'มีการเพิ่ม/ลบ/เปลี่ยนอุปกรณ์' },
      { id: 'check_socket', type: 'decision', text: '1. ตรวจ Socket CPU กับ Mainboard' },
      { id: 'err_socket', type: 'process', text: 'บันทึกเตือน: Socket ไม่ตรงกัน', col: 1 },
      { id: 'check_ram', type: 'decision', text: '2. ตรวจ RAM Type กับ Mainboard' },
      { id: 'err_ram', type: 'process', text: 'บันทึกเตือน: RAM Type ไม่รองรับ', col: 1 },
      { id: 'check_power', type: 'decision', text: '3. คำนวณ TDP รวมกับ PSU Watt' },
      { id: 'err_power', type: 'process', text: 'บันทึกเตือน: PSU Watt ไม่พอ', col: 1 },
      { id: 'compile', type: 'process', text: 'รวบรวมผลการตรวจสอบทั้งหมด' },
      { id: 'status', type: 'decision', text: 'พบข้อผิดพลาด ความไม่เข้ากันหรือไม่?' },
      { id: 'pass_ui', type: 'input', text: 'แสดงแถบเขียว: เข้ากันได้ 100%' },
      { id: 'warn_ui', type: 'input', text: 'แสดงแถบเตือนสีแดง/ส้ม พร้อมวิธีแก้', col: 1 },
      { id: 'end', type: 'end', text: 'จบการทำงาน' }
    ],
    connections: [
      { from: 'start', to: 'monitor' },
      { from: 'monitor', to: 'event' },
      { from: 'event', to: 'check_socket' },
      { from: 'check_socket', to: 'check_ram', exit: 'bottom', label: 'ตรงกัน' },
      { from: 'check_socket', to: 'err_socket', exit: 'right', label: 'ไม่ตรงกัน' },
      { from: 'err_socket', to: 'check_ram' },
      { from: 'check_ram', to: 'check_power', exit: 'bottom', label: 'รองรับ' },
      { from: 'check_ram', to: 'err_ram', exit: 'right', label: 'ไม่รองรับ' },
      { from: 'err_ram', to: 'check_power' },
      { from: 'check_power', to: 'compile', exit: 'bottom', label: 'เพียงพอ' },
      { from: 'check_power', to: 'err_power', exit: 'right', label: 'ไม่พอ' },
      { from: 'err_power', to: 'compile' },
      { from: 'compile', to: 'status' },
      { from: 'status', to: 'pass_ui', exit: 'bottom', label: 'เข้ากันได้ 100%' },
      { from: 'status', to: 'warn_ui', exit: 'right', label: 'พบข้อผิดพลาด' },
      { from: 'pass_ui', to: 'end' },
      { from: 'warn_ui', to: 'end' }
    ]
  }
];

// Generate individual .drawio files
flowcharts.forEach((fc) => {
  const xml = generateDrawioXml(fc.title, fc.nodes, fc.connections);
  const filePath = path.join(drawioDir, fc.filename);
  fs.writeFileSync(filePath, xml, 'utf8');
  console.log(`Generated Monochrome Draw.io file: ${fc.filename}`);
});

// Create master multi-tab .drawio file
let masterDiagramsXml = '';
flowcharts.forEach((fc, idx) => {
  const xml = generateDrawioXml(fc.title, fc.nodes, fc.connections);
  const match = xml.match(/<diagram[\s\S]*?<\/diagram>/);
  if (match) {
    let diagramStr = match[0];
    diagramStr = diagramStr.replace(/id="diagram_1"/, `id="diagram_${idx + 1}"`);
    masterDiagramsXml += diagramStr + '\n';
  }
});

const masterXml = `<mxfile host="Electron" modified="${new Date().toISOString()}" agent="PCSpec Master Generator" version="21.0.0" type="device">
${masterDiagramsXml}</mxfile>`;

const masterPath = path.join(drawioDir, 'pcspec_all_11_flowcharts.drawio');
fs.writeFileSync(masterPath, masterXml, 'utf8');
console.log('Successfully created master Monochrome Draw.io file: pcspec_all_11_flowcharts.drawio');
