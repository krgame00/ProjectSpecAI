const fs = require('fs');

function updateFlowchartsToYesNo() {
  const fPath = 'C:/Users/PC/Downloads/pcspec_all_11_flowcharts (1).drawio';
  let content = fs.readFileSync(fPath, 'utf8');

  // Specific replacements for Flowcharts
  // 1. Registration
  content = content.replace(
    /id="val_client"([^>]*)value="[^"]*"/,
    'id="val_client"$1value="กรอกข้อมูลครบถ้วน&lt;br&gt;และถูกต้องหรือไม่?"'
  );
  content = content.replace(
    /<mxCell id="edge_3" edge="1" parent="1" source="val_client"([^>]*)value="ถูกต้อง"/g,
    '<mxCell id="edge_3" edge="1" parent="1" source="val_client"$1value="ใช่"'
  );
  content = content.replace(
    /<mxCell id="edge_4" edge="1" parent="1" source="val_client"([^>]*)value="ไม่ถูกต้อง"/g,
    '<mxCell id="edge_4" edge="1" parent="1" source="val_client"$1value="ไม่ใช่"'
  );

  content = content.replace(
    /id="check_db"([^>]*)value="[^"]*"/,
    'id="check_db"$1value="พบอีเมลซ้ำในระบบหรือไม่?"'
  );
  content = content.replace(
    /value="อีเมลซ้ำ"/g,
    'value="ใช่"'
  );
  content = content.replace(
    /value="ไม่ซ้ำ"/g,
    'value="ไม่ใช่"'
  );

  // 2. Login
  content = content.replace(
    /id="verify"([^>]*)value="[^"]*"/,
    'id="verify"$1value="ข้อมูลบัญชีและรหัสผ่าน&lt;br&gt;ถูกต้องหรือไม่?"'
  );
  content = content.replace(
    /<mxCell id="edge_4" edge="1" parent="1" source="verify"([^>]*)value="ถูกต้อง"/g,
    '<mxCell id="edge_4" edge="1" parent="1" source="verify"$1value="ใช่"'
  );
  content = content.replace(
    /<mxCell id="edge_5" edge="1" parent="1" source="verify"([^>]*)value="ไม่ถูกต้อง"/g,
    '<mxCell id="edge_5" edge="1" parent="1" source="verify"$1value="ไม่ใช่"'
  );

  // 3. Manual Builder
  content = content.replace(
    /<mxCell id="edge_4" edge="1" parent="1" source="user_action"([^>]*)value="จัดเพิ่ม"/g,
    '<mxCell id="edge_4" edge="1" parent="1" source="user_action"$1value="ใช่"'
  );
  content = content.replace(
    /<mxCell id="edge_5" edge="1" parent="1" source="user_action"([^>]*)value="เสร็จสิ้น"/g,
    '<mxCell id="edge_5" edge="1" parent="1" source="user_action"$1value="ไม่ใช่"'
  );

  // 4. SpecAI
  content = content.replace(
    /<mxCell id="edge_6" edge="1" parent="1" source="confirm"([^>]*)value="พึงพอใจ"/g,
    '<mxCell id="edge_6" edge="1" parent="1" source="confirm"$1value="ใช่"'
  );
  content = content.replace(
    /<mxCell id="edge_7" edge="1" parent="1" source="confirm"([^>]*)value="ไม่พึงพอใจ"/g,
    '<mxCell id="edge_7" edge="1" parent="1" source="confirm"$1value="ไม่ใช่"'
  );

  // 5. Chatbot
  content = content.replace(
    /<mxCell id="edge_5" edge="1" parent="1" source="ask_more"([^>]*)value="ถามเพิ่ม"/g,
    '<mxCell id="edge_5" edge="1" parent="1" source="ask_more"$1value="ใช่"'
  );
  content = content.replace(
    /<mxCell id="edge_6" edge="1" parent="1" source="ask_more"([^>]*)value="ปิดแชต"/g,
    '<mxCell id="edge_6" edge="1" parent="1" source="ask_more"$1value="ไม่ใช่"'
  );

  // 6 & 7. Admin check
  content = content.replace(
    /id="check_admin"([^>]*)value="[^"]*"/g,
    'id="check_admin"$1value="เป็นผู้ดูแลระบบ (Admin)&lt;br&gt;หรือไม่?"'
  );
  content = content.replace(
    /value="เป็นผู้ดูแลระบบ"/g,
    'value="ใช่"'
  );
  content = content.replace(
    /value="ไม่ใช่ผู้ดูแลระบบ"/g,
    'value="ไม่ใช่"'
  );
  content = content.replace(
    /value="มีรูปภาพ"/g,
    'value="ใช่"'
  );
  content = content.replace(
    /value="ไม่มีรูป"/g,
    'value="ไม่ใช่"'
  );
  content = content.replace(
    /value="ยืนยัน"/g,
    'value="ใช่"'
  );
  content = content.replace(
    /<mxCell id="edge_6" edge="1" parent="1" source="confirm_del"([^>]*)value="ยกเลิก"/g,
    '<mxCell id="edge_6" edge="1" parent="1" source="confirm_del"$1value="ไม่ใช่"'
  );

  // 9. Order
  content = content.replace(
    /id="check_empty"([^>]*)value="[^"]*"/,
    'id="check_empty"$1value="มีสินค้าในรายการจัดสเปค&lt;br&gt;หรือไม่?"'
  );
  content = content.replace(
    /value="มีสินค้า"/g,
    'value="ใช่"'
  );
  content = content.replace(
    /value="ไม่มีสินค้า"/g,
    'value="ไม่ใช่"'
  );
  content = content.replace(
    /id="check_auth"([^>]*)value="[^"]*"/,
    'id="check_auth"$1value="เข้าสู่ระบบ (Login)&lt;br&gt;แล้วหรือไม่?"'
  );
  content = content.replace(
    /value="เข้าสู่ระบบแล้ว"/g,
    'value="ใช่"'
  );
  content = content.replace(
    /value="ยังไม่เข้าสู่ระบบ"/g,
    'value="ไม่ใช่"'
  );

  // 10. Print PDF
  content = content.replace(
    /id="print_dialog"([^>]*)value="[^"]*"/,
    'id="print_dialog"$1value="ยืนยันการพิมพ์ / บันทึก PDF&lt;br&gt;หรือไม่?"'
  );
  content = content.replace(
    /value="พิมพ์ \/ Save PDF"/g,
    'value="ใช่"'
  );
  content = content.replace(
    /<mxCell id="edge_3" edge="1" parent="1" source="print_dialog"([^>]*)value="ยกเลิก"/g,
    '<mxCell id="edge_3" edge="1" parent="1" source="print_dialog"$1value="ไม่ใช่"'
  );

  // 11. Compatibility Check
  content = content.replace(
    /value="ตรงกัน"/g,
    'value="ใช่"'
  );
  content = content.replace(
    /value="ไม่ตรงกัน"/g,
    'value="ไม่ใช่"'
  );
  content = content.replace(
    /value="รองรับ"/g,
    'value="ใช่"'
  );
  content = content.replace(
    /value="ไม่รองรับ"/g,
    'value="ไม่ใช่"'
  );
  content = content.replace(
    /value="เพียงพอ"/g,
    'value="ใช่"'
  );
  content = content.replace(
    /value="ไม่พอ"/g,
    'value="ไม่ใช่"'
  );
  content = content.replace(
    /value="พบข้อผิดพลาด"/g,
    'value="ใช่"'
  );
  content = content.replace(
    /value="เข้ากันได้ 100%"/g,
    'value="ไม่ใช่"'
  );

  fs.writeFileSync(fPath, content, 'utf8');
  console.log('Successfully updated 11 Flowcharts with ใช่ / ไม่ใช่ to:', fPath);
}

updateFlowchartsToYesNo();
