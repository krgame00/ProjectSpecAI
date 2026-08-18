const fs = require('fs');
const path = require('path');

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// 1. GENERATE USE CASE DIAGRAM (.drawio)
function generateUseCaseDrawio() {
  const filePath = 'C:/Users/PC/Downloads/pcspec_usecase_diagram.drawio';
  
  const content = `<mxfile host="Electron" modified="${new Date().toISOString()}" agent="PCSpec Generator" version="21.0.0" type="device">
  <diagram id="diagram_usecase" name="Use Case Diagram (PCSpec)">
    <mxGraphModel dx="1400" dy="1200" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="1654" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- Title Header -->
        <mxCell id="title" value="Use Case Diagram: ระบบจัดสเปคและประมาณราคาคอมพิวเตอร์พร้อมสเปคแชตบอตอัจฉริยะ (PCSpec)" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=18;fontStyle=1;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="120" y="20" width="860" height="40" as="geometry" />
        </mxCell>

        <!-- System Boundary Box -->
        <mxCell id="boundary" value="ระบบจัดสเปคคอมพิวเตอร์และแชตบอตอัจฉริยะ (PCSpec System)" style="shape=swimlane;startSize=30;fontSize=14;fontStyle=1;align=center;horizontal=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=2;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="240" y="80" width="620" height="980" as="geometry" />
        </mxCell>

        <!-- Actors -->
        <!-- Actor 1: Customer (Left) -->
        <mxCell id="actor_customer" value="ผู้ใช้งานทั่วไป / ลูกค้า&#xa;(Customer)" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;strokeColor=#000000;strokeWidth=1.8;fillColor=#ffffff;fontSize=13;fontStyle=1;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="80" y="380" width="60" height="110" as="geometry" />
        </mxCell>

        <!-- Actor 2: Admin (Left Bottom) -->
        <mxCell id="actor_admin" value="ผู้ดูแลระบบ&#xa;(Admin)" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;strokeColor=#000000;strokeWidth=1.8;fillColor=#ffffff;fontSize=13;fontStyle=1;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="80" y="780" width="60" height="110" as="geometry" />
        </mxCell>

        <!-- Actor 3: External Gemini AI (Right) -->
        <mxCell id="actor_ai" value="&lt;&lt;Service&gt;&gt;&#xa;Google Gemini API&#xa;(LLM AI Engine)" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;strokeColor=#000000;strokeWidth=1.8;fillColor=#ffffff;fontSize=13;fontStyle=1;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="960" y="440" width="60" height="110" as="geometry" />
        </mxCell>

        <!-- Use Cases inside Boundary -->
        <!-- UC1: Register & Login -->
        <mxCell id="uc_auth" value="1. สมัครสมาชิกและเข้าสู่ระบบ&#xa;(Register / Login)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=12;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="40" y="50" width="220" height="60" as="geometry" />
        </mxCell>

        <!-- UC2: Search & Browse Catalog -->
        <mxCell id="uc_catalog" value="2. ค้นหาและดูแคตตาล็อกอุปกรณ์&#xa;(Search &amp; Browse Hardware)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=12;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="40" y="130" width="220" height="60" as="geometry" />
        </mxCell>

        <!-- UC3: Manual PC Builder -->
        <mxCell id="uc_builder" value="3. จัดสเปคคอมพิวเตอร์ด้วยตนเอง&#xa;(Manual PC Builder)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=12;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="40" y="210" width="220" height="60" as="geometry" />
        </mxCell>

        <!-- UC4: Check Compatibility (Include) -->
        <mxCell id="uc_compat" value="4. ตรวจสอบความเข้ากันได้ของอุปกรณ์&#xa;(Compatibility Validation)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=12;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="350" y="170" width="230" height="60" as="geometry" />
        </mxCell>

        <!-- UC5: Calc Price & Wattage (Include) -->
        <mxCell id="uc_calc" value="5. คำนวณราคารวมและกำลังไฟรวม&#xa;(Price &amp; Wattage Calc)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=12;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="350" y="250" width="230" height="60" as="geometry" />
        </mxCell>

        <!-- UC6: SpecAI Chatbot Guidance -->
        <mxCell id="uc_chatbot" value="6. สนทนาและขอคำแนะนำจัดสเปคกับ AI&#xa;(Chat with SpecAI Assistant)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=12;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="190" y="340" width="250" height="65" as="geometry" />
        </mxCell>

        <!-- UC7: Apply AI Preset to Cart (Extend) -->
        <mxCell id="uc_preset" value="7. นำสเปคจาก AI ลงตะกร้าอัตโนมัติ&#xa;(Apply Preset to Builder)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=12;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="350" y="430" width="230" height="60" as="geometry" />
        </mxCell>

        <!-- UC8: View Charts & Visuals -->
        <mxCell id="uc_charts" value="8. แสดงกราฟสัดส่วนราคาและสถิติ&#xa;(View Price &amp; Spec Charts)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=12;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="40" y="430" width="220" height="60" as="geometry" />
        </mxCell>

        <!-- UC9: Print / Export PDF -->
        <mxCell id="uc_print" value="9. พิมพ์ใบเสนอราคาและบันทึก PDF&#xa;(Export / Print Spec Sheet)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=12;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="40" y="510" width="220" height="60" as="geometry" />
        </mxCell>

        <!-- UC10: Order & Checkout -->
        <mxCell id="uc_order" value="10. สั่งซื้อสินค้าและบันทึกคำสั่งซื้อ&#xa;(Checkout &amp; Place Order)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=12;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="40" y="590" width="220" height="60" as="geometry" />
        </mxCell>

        <!-- UC11: Articles -->
        <mxCell id="uc_articles" value="11. อ่านบทความและข่าวสารไอที&#xa;(Read Tech News &amp; Articles)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=12;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="40" y="670" width="220" height="60" as="geometry" />
        </mxCell>

        <!-- UC12: Admin Manage Hardware (CRUD) -->
        <mxCell id="uc_admin_hw" value="12. จัดการข้อมูลอุปกรณ์ (เพิ่ม/ลบ/แก้ไข)&#xa;(Manage Hardware Catalog)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=12;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="40" y="760" width="240" height="60" as="geometry" />
        </mxCell>

        <!-- UC13: Admin Manage Orders -->
        <mxCell id="uc_admin_order" value="13. ตรวจสอบและจัดการคำสั่งซื้อ&#xa;(Manage Customer Orders)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=12;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="40" y="840" width="240" height="60" as="geometry" />
        </mxCell>

        <!-- UC14: Admin Manage Articles -->
        <mxCell id="uc_admin_art" value="14. จัดการบทความและข่าวสารไอที&#xa;(Manage IT Articles)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=12;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="40" y="910" width="240" height="60" as="geometry" />
        </mxCell>

        <!-- Connections from Customer -->
        <mxCell id="edge_c_auth" edge="1" parent="1" source="actor_customer" target="uc_auth" style="strokeColor=#000000;strokeWidth=1.5;endArrow=none;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="edge_c_cat" edge="1" parent="1" source="actor_customer" target="uc_catalog" style="strokeColor=#000000;strokeWidth=1.5;endArrow=none;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="edge_c_build" edge="1" parent="1" source="actor_customer" target="uc_builder" style="strokeColor=#000000;strokeWidth=1.5;endArrow=none;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="edge_c_chat" edge="1" parent="1" source="actor_customer" target="uc_chatbot" style="strokeColor=#000000;strokeWidth=1.5;endArrow=none;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="edge_c_charts" edge="1" parent="1" source="actor_customer" target="uc_charts" style="strokeColor=#000000;strokeWidth=1.5;endArrow=none;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="edge_c_print" edge="1" parent="1" source="actor_customer" target="uc_print" style="strokeColor=#000000;strokeWidth=1.5;endArrow=none;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="edge_c_order" edge="1" parent="1" source="actor_customer" target="uc_order" style="strokeColor=#000000;strokeWidth=1.5;endArrow=none;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="edge_c_art" edge="1" parent="1" source="actor_customer" target="uc_articles" style="strokeColor=#000000;strokeWidth=1.5;endArrow=none;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Connections from Admin -->
        <mxCell id="edge_a_auth" edge="1" parent="1" source="actor_admin" target="uc_auth" style="strokeColor=#000000;strokeWidth=1.5;endArrow=none;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="edge_a_hw" edge="1" parent="1" source="actor_admin" target="uc_admin_hw" style="strokeColor=#000000;strokeWidth=1.5;endArrow=none;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="edge_a_order" edge="1" parent="1" source="actor_admin" target="uc_admin_order" style="strokeColor=#000000;strokeWidth=1.5;endArrow=none;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="edge_a_art" edge="1" parent="1" source="actor_admin" target="uc_admin_art" style="strokeColor=#000000;strokeWidth=1.5;endArrow=none;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Connections to Gemini AI -->
        <mxCell id="edge_ai_chat" edge="1" parent="1" source="actor_ai" target="uc_chatbot" style="strokeColor=#000000;strokeWidth=1.5;endArrow=none;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- <<include>> relationships -->
        <mxCell id="inc_compat" value="&lt;&lt;include&gt;&gt;" style="dashed=1;strokeColor=#000000;strokeWidth=1.2;fontSize=10;fontStyle=2;endArrow=open;endSize=8;html=1;" edge="1" parent="boundary" source="uc_builder" target="uc_compat">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="inc_calc" value="&lt;&lt;include&gt;&gt;" style="dashed=1;strokeColor=#000000;strokeWidth=1.2;fontSize=10;fontStyle=2;endArrow=open;endSize=8;html=1;" edge="1" parent="boundary" source="uc_builder" target="uc_calc">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- <<extend>> relationship -->
        <mxCell id="ext_preset" value="&lt;&lt;extend&gt;&gt;" style="dashed=1;strokeColor=#000000;strokeWidth=1.2;fontSize=10;fontStyle=2;endArrow=open;endSize=8;html=1;" edge="1" parent="boundary" source="uc_preset" target="uc_chatbot">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Created Use Case Diagram at:', filePath);
}

// 2. GENERATE ACTIVITY DIAGRAM (.drawio)
function generateActivityDrawio() {
  const filePath = 'C:/Users/PC/Downloads/pcspec_activity_diagram.drawio';
  
  const content = `<mxfile host="Electron" modified="${new Date().toISOString()}" agent="PCSpec Generator" version="21.0.0" type="device">
  <diagram id="diagram_activity" name="Activity Diagram (PCSpec)">
    <mxGraphModel dx="1400" dy="1200" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="1654" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- Title Header -->
        <mxCell id="title" value="Activity Diagram: ขั้นตอนการจัดสเปคคอมพิวเตอร์และการประมวลผลของระบบ (PCSpec)" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=18;fontStyle=1;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="120" y="20" width="860" height="40" as="geometry" />
        </mxCell>

        <!-- Swimlanes Container -->
        <!-- Lane 1: Customer (User) -->
        <mxCell id="lane_user" value="ผู้ใช้งาน (Customer)" style="shape=swimlane;startSize=30;fontSize=13;fontStyle=1;align=center;horizontal=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.8;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="60" y="80" width="240" height="1160" as="geometry" />
        </mxCell>

        <!-- Lane 2: Front-end (Vue.js) -->
        <mxCell id="lane_front" value="ระบบหน้าเว็บ (Vue.js Front-end)" style="shape=swimlane;startSize=30;fontSize=13;fontStyle=1;align=center;horizontal=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.8;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="300" y="80" width="270" height="1160" as="geometry" />
        </mxCell>

        <!-- Lane 3: Back-end & Database -->
        <mxCell id="lane_back" value="เซิร์ฟเวอร์ &amp; ฐานข้อมูล (Node.js &amp; MySQL)" style="shape=swimlane;startSize=30;fontSize=13;fontStyle=1;align=center;horizontal=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.8;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="570" y="80" width="270" height="1160" as="geometry" />
        </mxCell>

        <!-- Lane 4: Gemini AI -->
        <mxCell id="lane_ai" value="ปัญญาประดิษฐ์ (Google Gemini API)" style="shape=swimlane;startSize=30;fontSize=13;fontStyle=1;align=center;horizontal=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.8;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="840" y="80" width="250" height="1160" as="geometry" />
        </mxCell>

        <!-- Initial Node -->
        <mxCell id="act_start" value="" style="ellipse;fillColor=#000000;strokeColor=#000000;" vertex="1" parent="lane_user">
          <mxGeometry x="105" y="45" width="30" height="30" as="geometry" />
        </mxCell>

        <!-- Act 1: Open Website -->
        <mxCell id="act_open" value="เข้าสู่เว็บไซต์จัดสเปคคอม" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=12;fontStyle=1;" vertex="1" parent="lane_user">
          <mxGeometry x="30" y="105" width="180" height="45" as="geometry" />
        </mxCell>

        <!-- Act 2: Fetch Catalog -->
        <mxCell id="act_fetch" value="ส่งคำขอดึงข้อมูลแคตตาล็อก" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=12;fontStyle=1;" vertex="1" parent="lane_front">
          <mxGeometry x="45" y="105" width="180" height="45" as="geometry" />
        </mxCell>

        <!-- Act 3: Query DB -->
        <mxCell id="act_db" value="ดึงข้อมูลชิ้นส่วน 7 หมวดหมู่จาก MySQL" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=12;fontStyle=1;" vertex="1" parent="lane_back">
          <mxGeometry x="45" y="105" width="180" height="45" as="geometry" />
        </mxCell>

        <!-- Act 4: Render UI -->
        <mxCell id="act_render" value="แสดงหน้าจัดสเปค 7 หมวดหมู่" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=12;fontStyle=1;" vertex="1" parent="lane_front">
          <mxGeometry x="45" y="180" width="180" height="45" as="geometry" />
        </mxCell>

        <!-- Decision 1: Manual or AI -->
        <mxCell id="act_dec_method" value="เลือกวิธีจัดสเปค?" style="rhombus;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="lane_user">
          <mxGeometry x="60" y="245" width="120" height="60" as="geometry" />
        </mxCell>

        <!-- Branch A: Manual Selection -->
        <mxCell id="act_manual_pick" value="เลือกชิ้นส่วนทีละหมวดหมู่&#xa;(CPU, MB, RAM, GPU, etc.)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="lane_user">
          <mxGeometry x="30" y="340" width="180" height="45" as="geometry" />
        </mxCell>

        <!-- Branch B: Ask AI -->
        <mxCell id="act_ai_prompt" value="เปิดแชตบอต ระบุงบประมาณ&#xa;และวัตถุประสงค์การใช้งาน" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="lane_user">
          <mxGeometry x="30" y="440" width="180" height="45" as="geometry" />
        </mxCell>

        <!-- AI Process Backend -->
        <mxCell id="act_ai_be" value="สร้าง Prompt แนบสินค้าในสต็อก" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="lane_back">
          <mxGeometry x="45" y="440" width="180" height="45" as="geometry" />
        </mxCell>

        <!-- AI Gemini Engine -->
        <mxCell id="act_gemini" value="ประมวลผลและสร้างชุดสเปค&#xa;ที่เหมาะสมในรูปแบบ JSON" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="lane_ai">
          <mxGeometry x="35" y="440" width="180" height="45" as="geometry" />
        </mxCell>

        <!-- AI Render Preset -->
        <mxCell id="act_ai_show" value="แสดงข้อความแนะนำและชุดสเปค" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="lane_front">
          <mxGeometry x="45" y="520" width="180" height="45" as="geometry" />
        </mxCell>

        <!-- Apply Preset Button -->
        <mxCell id="act_apply_preset" value="กดปุ่มนำสเปคลงตะกร้าอัตโนมัติ" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="lane_user">
          <mxGeometry x="30" y="520" width="180" height="45" as="geometry" />
        </mxCell>

        <!-- Real-time Validation & Calc in Front-end -->
        <mxCell id="act_validate" value="ตรวจสอบความเข้ากันได้:&#xa;Socket, RAM Type, กำลังไฟ PSU" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="lane_front">
          <mxGeometry x="45" y="610" width="180" height="50" as="geometry" />
        </mxCell>

        <!-- Decision 2: Compatible? -->
        <mxCell id="act_dec_compat" value="อุปกรณ์เข้ากันได้ไหม?" style="rhombus;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="lane_front">
          <mxGeometry x="70" y="690" width="130" height="60" as="geometry" />
        </mxCell>

        <!-- Error Warning Alert -->
        <mxCell id="act_warn" value="แสดงแถบแจ้งเตือนข้อผิดพลาด&#xa;พร้อมแนะนำชิ้นส่วนที่ถูกต้อง" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="lane_front">
          <mxGeometry x="45" y="780" width="180" height="45" as="geometry" />
        </mxCell>

        <!-- Success Calc & Charts -->
        <mxCell id="act_summary" value="คำนวณราคารวม วัตต์รวม&#xa;และวาดกราฟสัดส่วนราคา (Chart.js)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="lane_front">
          <mxGeometry x="45" y="860" width="180" height="50" as="geometry" />
        </mxCell>

        <!-- Customer Decision Final Action -->
        <mxCell id="act_dec_final" value="เลือกการทำงานถัดไป" style="rhombus;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="lane_user">
          <mxGeometry x="60" y="855" width="120" height="60" as="geometry" />
        </mxCell>

        <!-- Action 1: Export PDF -->
        <mxCell id="act_pdf" value="สั่งพิมพ์ / บันทึกใบเสนอราคา (PDF)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="lane_front">
          <mxGeometry x="45" y="950" width="180" height="45" as="geometry" />
        </mxCell>

        <!-- Action 2: Order -->
        <mxCell id="act_checkout" value="กรอกข้อมูลจัดส่งและยืนยันการสั่งซื้อ" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="lane_user">
          <mxGeometry x="30" y="950" width="180" height="45" as="geometry" />
        </mxCell>

        <!-- Save Order in DB -->
        <mxCell id="act_save_order" value="บันทึกคำสั่งซื้อลงตาราง orders&#xa;และส่งอีเมลแจ้งเตือน" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="lane_back">
          <mxGeometry x="45" y="950" width="180" height="45" as="geometry" />
        </mxCell>

        <!-- Final End Node -->
        <mxCell id="act_end" value="" style="ellipse;html=1;shape=endState;fillColor=#000000;strokeColor=#000000;" vertex="1" parent="lane_front">
          <mxGeometry x="120" y="1050" width="30" height="30" as="geometry" />
        </mxCell>

        <!-- Edges Flow Connections -->
        <mxCell id="e1" edge="1" parent="1" source="act_start" target="act_open" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e2" edge="1" parent="1" source="act_open" target="act_fetch" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e3" edge="1" parent="1" source="act_fetch" target="act_db" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e4" edge="1" parent="1" source="act_db" target="act_render" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e5" edge="1" parent="1" source="act_render" target="act_dec_method" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e6" value="จัดเอง" edge="1" parent="1" source="act_dec_method" target="act_manual_pick" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;fontSize=10;fontStyle=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e7" value="ให้ AI ช่วย" edge="1" parent="1" source="act_dec_method" target="act_ai_prompt" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;fontSize=10;fontStyle=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e8" edge="1" parent="1" source="act_ai_prompt" target="act_ai_be" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e9" edge="1" parent="1" source="act_ai_be" target="act_gemini" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e10" edge="1" parent="1" source="act_gemini" target="act_ai_show" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e11" edge="1" parent="1" source="act_ai_show" target="act_apply_preset" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e12" edge="1" parent="1" source="act_apply_preset" target="act_validate" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e13" edge="1" parent="1" source="act_manual_pick" target="act_validate" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e14" edge="1" parent="1" source="act_validate" target="act_dec_compat" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e15" value="ไม่เข้ากัน" edge="1" parent="1" source="act_dec_compat" target="act_warn" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;fontSize=10;fontStyle=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e16" value="เข้ากันได้" edge="1" parent="1" source="act_dec_compat" target="act_summary" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;fontSize=10;fontStyle=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e17" edge="1" parent="1" source="act_warn" target="act_manual_pick" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;edgeStyle=orthogonalEdgeStyle;">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="435" y="830" />
              <mxPoint x="290" y="830" />
              <mxPoint x="290" y="362" />
            </Array>
          </mxGeometry>
        </mxCell>
        <mxCell id="e18" edge="1" parent="1" source="act_summary" target="act_dec_final" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e19" value="พิมพ์ใบเสนอราคา" edge="1" parent="1" source="act_dec_final" target="act_pdf" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;fontSize=10;fontStyle=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e20" value="สั่งซื้อสินค้า" edge="1" parent="1" source="act_dec_final" target="act_checkout" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;fontSize=10;fontStyle=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e21" edge="1" parent="1" source="act_checkout" target="act_save_order" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e22" edge="1" parent="1" source="act_pdf" target="act_end" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e23" edge="1" parent="1" source="act_save_order" target="act_end" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;edgeStyle=orthogonalEdgeStyle;">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="705" y="1065" />
            </Array>
          </mxGeometry>
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Created Activity Diagram at:', filePath);
}

generateUseCaseDrawio();
generateActivityDrawio();
