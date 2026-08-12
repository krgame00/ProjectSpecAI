const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'docs', 'flowcharts');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
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

function generateSvg(title, nodes, connections, svgIndex) {
  const boxWidth = 260;
  const boxHeight = 54;
  const diamondWidth = 240;
  const diamondHeight = 94;
  const paddingY = 60;
  const startX = 400;
  const startY = 60;

  const arrowId = `arrow_${svgIndex}`;

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
      y: currentY + h / 2,
      w: w,
      h: h,
      col: col
    };

    currentY += h + paddingY;
  });

  const maxX = Math.max(...Object.values(positions).map(p => p.x + p.w / 2)) + 80;
  const svgWidth = Math.max(880, maxX);
  const svgHeight = currentY + 40;

  // BLACK & WHITE CLEAN ACADEMIC MONOCHROME STYLE
  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}" style="background-color: #ffffff; font-family: 'Inter', system-ui, sans-serif;">
  <defs>
    <marker id="${arrowId}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#000000" />
    </marker>
  </defs>

  <!-- Title Header -->
  <rect x="0" y="0" width="${svgWidth}" height="50" fill="#f8f9fa" stroke="#e9ecef" stroke-width="1"/>
  <text x="30" y="32" fill="#000000" font-size="18" font-weight="700">${escapeXml(title)}</text>
  <text x="${svgWidth - 260}" y="32" fill="#495057" font-size="12" font-weight="600">✓ 100% Strict Vertex Snapping</text>
`;

  // Draw connections (Black 2px lines)
  connections.forEach(conn => {
    const from = positions[conn.from];
    const to = positions[conn.to];
    if (!from || !to) return;

    let pathD = '';
    let labelX = 0;
    let labelY = 0;

    if (from.type === 'decision') {
      if (conn.exit === 'right') {
        const sx = from.x + from.w / 2;
        const sy = from.y;

        if (conn.entry === 'top') {
          const ex = to.x;
          const ey = to.y - to.h / 2;
          const midX = Math.max(sx + 80, ex);
          pathD = `M ${sx} ${sy} L ${midX} ${sy} L ${midX} ${ey - 25} L ${ex} ${ey - 25} L ${ex} ${ey}`;
          labelX = sx + 15;
          labelY = sy - 10;
        } else if (conn.entry === 'right') {
          const ex = to.x + to.w / 2;
          const ey = to.y;
          const midX = Math.max(sx + 100, ex + 60);
          pathD = `M ${sx} ${sy} L ${midX} ${sy} L ${midX} ${ey} L ${ex} ${ey}`;
          labelX = sx + 15;
          labelY = sy - 10;
        } else {
          const ex = to.x;
          const ey = to.y - to.h / 2;
          const midX = sx + 100;
          pathD = `M ${sx} ${sy} L ${midX} ${sy} L ${midX} ${ey - 25} L ${ex} ${ey - 25} L ${ex} ${ey}`;
          labelX = sx + 15;
          labelY = sy - 10;
        }
      } else {
        // Exit from BOTTOM VERTEX
        const sx = from.x;
        const sy = from.y + from.h / 2;
        const ex = to.x;
        const ey = to.y - to.h / 2;

        if (sx === ex) {
          pathD = `M ${sx} ${sy} L ${ex} ${ey}`;
        } else {
          const midY = (sy + ey) / 2;
          pathD = `M ${sx} ${sy} L ${sx} ${midY} L ${ex} ${midY} L ${ex} ${ey}`;
        }
        labelX = sx + 12;
        labelY = sy + 25;
      }
    } else {
      // Normal node
      const sx = from.x;
      const sy = from.y + from.h / 2;
      const ex = to.x;
      const ey = to.y - to.h / 2;

      if (sx === ex) {
        pathD = `M ${sx} ${sy} L ${ex} ${ey}`;
      } else {
        const midY = (sy + ey) / 2;
        pathD = `M ${sx} ${sy} L ${sx} ${midY} L ${ex} ${midY} L ${ex} ${ey}`;
      }
    }

    svgContent += `  <path d="${pathD}" fill="none" stroke="#000000" stroke-width="2" marker-end="url(#${arrowId})" />\n`;

    if (conn.label) {
      const lblWidth = conn.label.length * 11 + 16;
      svgContent += `  <rect x="${labelX - 4}" y="${labelY - 14}" width="${lblWidth}" height="22" rx="3" fill="#ffffff" stroke="#000000" stroke-width="1.5"/>
  <text x="${labelX + 4}" y="${labelY + 2}" fill="#000000" font-size="12" font-weight="700">${escapeXml(conn.label)}</text>\n`;
    }
  });

  // Draw nodes (Black lines on White background)
  nodes.forEach(node => {
    const pos = positions[node.id];
    const x = pos.x;
    const y = pos.y;
    const w = pos.w;
    const h = pos.h;
    const txt = escapeXml(node.text);

    if (node.type === 'start' || node.type === 'end') {
      svgContent += `  <g>
    <rect x="${x - w/2}" y="${y - h/2}" width="${w}" height="${h}" rx="${h/2}" fill="#ffffff" stroke="#000000" stroke-width="2.5"/>
    <text x="${x}" y="${y + 5}" fill="#000000" font-size="14" font-weight="700" text-anchor="middle">${txt}</text>
  </g>\n`;
    } else if (node.type === 'decision') {
      const points = `${x},${y - h/2} ${x + w/2},${y} ${x},${y + h/2} ${x - w/2},${y}`;
      svgContent += `  <g>
    <polygon points="${points}" fill="#ffffff" stroke="#000000" stroke-width="2.5"/>
    <!-- Black vertex indicator dots -->
    <circle cx="${x}" cy="${y - h/2}" r="3.5" fill="#000000"/>
    <circle cx="${x + w/2}" cy="${y}" r="3.5" fill="#000000"/>
    <circle cx="${x}" cy="${y + h/2}" r="3.5" fill="#000000"/>
    <circle cx="${x - w/2}" cy="${y}" r="3.5" fill="#000000"/>
    <text x="${x}" y="${y + 5}" fill="#000000" font-size="13" font-weight="700" text-anchor="middle">${txt}</text>
  </g>\n`;
    } else if (node.type === 'input') {
      const slant = 18;
      const points = `${x - w/2 + slant},${y - h/2} ${x + w/2},${y - h/2} ${x + w/2 - slant},${y + h/2} ${x - w/2},${y + h/2}`;
      svgContent += `  <g>
    <polygon points="${points}" fill="#ffffff" stroke="#000000" stroke-width="2"/>
    <text x="${x}" y="${y + 5}" fill="#000000" font-size="13" font-weight="600" text-anchor="middle">${txt}</text>
  </g>\n`;
    } else {
      svgContent += `  <g>
    <rect x="${x - w/2}" y="${y - h/2}" width="${w}" height="${h}" rx="4" fill="#ffffff" stroke="#000000" stroke-width="2"/>
    <text x="${x}" y="${y + 5}" fill="#000000" font-size="13" font-weight="600" text-anchor="middle">${txt}</text>
  </g>\n`;
    }
  });

  svgContent += `</svg>`;
  return svgContent;
}

// ALL 11 FLOWCHARTS DEFINITION
const flowcharts = [
  {
    filename: '1_register.svg',
    drawioName: '1_register.drawio',
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
      { from: 'err_client', to: 'input', entry: 'top' },
      { from: 'send_api', to: 'check_db' },
      { from: 'check_db', to: 'hash_pwd', exit: 'bottom', label: 'ไม่ซ้ำ' },
      { from: 'check_db', to: 'err_db', exit: 'right', entry: 'top', label: 'อีเมลซ้ำ' },
      { from: 'err_db', to: 'input', entry: 'top' },
      { from: 'hash_pwd', to: 'save_db' },
      { from: 'save_db', to: 'success' },
      { from: 'success', to: 'redirect' },
      { from: 'redirect', to: 'end' }
    ]
  },
  {
    filename: '2_login.svg',
    drawioName: '2_login.drawio',
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
      { from: 'err_login', to: 'input', entry: 'top' },
      { from: 'gen_token', to: 'save_store' },
      { from: 'save_store', to: 'check_role' },
      { from: 'check_role', to: 'go_build', exit: 'bottom', label: 'Customer' },
      { from: 'check_role', to: 'go_admin', exit: 'right', entry: 'top', label: 'Admin' },
      { from: 'go_build', to: 'end' },
      { from: 'go_admin', to: 'end' }
    ]
  },
  {
    filename: '3_builder.svg',
    drawioName: '3_builder.drawio',
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
    filename: '4_specai.svg',
    drawioName: '4_specai.drawio',
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
    filename: '5_chatbot.svg',
    drawioName: '5_chatbot.drawio',
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
    filename: '6_admin_add.svg',
    drawioName: '6_admin_add.drawio',
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
    filename: '7_admin_edit.svg',
    drawioName: '7_admin_edit.drawio',
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
    filename: '8_articles.svg',
    drawioName: '8_articles.drawio',
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
    filename: '9_checkout.svg',
    drawioName: '9_checkout.drawio',
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
    filename: '10_print_pdf.svg',
    drawioName: '10_print_pdf.drawio',
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
    filename: '11_compatibility.svg',
    drawioName: '11_compatibility.drawio',
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

// Write SVGs and build HTML Studio viewer
let htmlGallery = '';

flowcharts.forEach((fc, idx) => {
  const svgXml = generateSvg(fc.title, fc.nodes, fc.connections, idx + 1);
  const filePath = path.join(outputDir, fc.filename);
  fs.writeFileSync(filePath, svgXml, 'utf8');
  console.log(`Generated Monochrome SVG: ${fc.filename}`);

  htmlGallery += `
    <section class="card" id="card_${idx + 1}">
      <div class="card-header">
        <h2>${escapeXml(fc.title)}</h2>
        <div class="btn-group">
          <a href="./drawio/${fc.drawioName}" download="${fc.drawioName}" class="btn btn-drawio">✏️ แก้ไขใน Draw.io (.drawio)</a>
          <a href="./flowcharts/${fc.filename}" download="${fc.filename}" class="btn">ดาวน์โหลด SVG ขาวดำ</a>
        </div>
      </div>
      <div class="svg-container">
        ${svgXml}
      </div>
    </section>\n`;
});

const htmlStudio = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>PCSpec Standard Flowchart Studio (Black & White Monochrome Academic Theme)</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #f8f9fa;
      --card-bg: #ffffff;
      --border: #ced4da;
      --text: #212529;
      --text-header: #000000;
    }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Inter', sans-serif;
      margin: 0;
      padding: 30px;
    }
    header {
      max-width: 1000px;
      margin: 0 auto 40px auto;
      text-align: center;
      border-bottom: 2px solid var(--border);
      padding-bottom: 20px;
    }
    h1 {
      color: var(--text-header);
      font-size: 28px;
      margin-bottom: 8px;
    }
    p.subtitle {
      color: #495057;
      font-size: 15px;
    }
    .badge-group {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-top: 15px;
    }
    .badge {
      display: inline-block;
      background: #212529;
      color: #ffffff;
      font-size: 13px;
      font-weight: 600;
      padding: 6px 14px;
      border-radius: 20px;
    }
    .badge-drawio {
      background: #0d6efd;
      text-decoration: none;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 40px;
    }
    .card {
      background: var(--card-bg);
      border: 1.5px solid var(--border);
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background: #e9ecef;
      border-bottom: 1.5px solid var(--border);
    }
    .card-header h2 {
      margin: 0;
      font-size: 18px;
      color: #000000;
    }
    .btn-group {
      display: flex;
      gap: 10px;
    }
    .btn {
      background: #212529;
      color: #ffffff;
      text-decoration: none;
      font-weight: 600;
      font-size: 13px;
      padding: 8px 16px;
      border-radius: 6px;
      transition: background 0.2s;
    }
    .btn:hover {
      background: #343a40;
    }
    .btn-drawio {
      background: #0d6efd;
    }
    .btn-drawio:hover {
      background: #0b5ed7;
    }
    .svg-container {
      padding: 30px;
      display: flex;
      justify-content: center;
      background: #ffffff;
      overflow-x: auto;
    }
    svg {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  <header>
    <h1>📐 PCSpec Standard Flowcharts (Black & White Academic Style)</h1>
    <p class="subtitle">สไตล์ขาวดำเรียบหรู สำหรับใส่เล่มรายงานวิชาการ ปริญญานิพนธ์ และสไลด์นำเสนอ</p>
    <div class="badge-group">
      <span class="badge">✓ สไตล์ขาวดำ ล็อกมุมแหลม (Vertices) 100%</span>
      <a href="./drawio/pcspec_all_11_flowcharts.drawio" download="pcspec_all_11_flowcharts.drawio" class="badge badge-drawio">✏️ ดาวน์โหลดไฟล์ขาวดำรวม (.drawio) ไปแก้ไขต่อใน Draw.io</a>
    </div>
  </header>

  <div class="container">
    ${htmlGallery}
  </div>
</body>
</html>`;

const studioPath = path.join(__dirname, '..', 'docs', 'flowcharts_studio.html');
fs.writeFileSync(studioPath, htmlStudio, 'utf8');
console.log('Successfully created Monochrome flowcharts_studio.html');
