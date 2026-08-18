const fs = require('fs');
const path = require('path');

function generateCleanActivityDrawio() {
  const filePath = 'C:/Users/PC/Downloads/pcspec_activity_diagram.drawio';
  const masterFilePath = 'C:/Users/PC/Downloads/pcspec_all_system_diagrams_master.drawio';

  const content = `<mxfile host="Electron" modified="${new Date().toISOString()}" agent="PCSpec Generator" version="21.0.0" type="device">
  <diagram id="diagram_activity" name="Activity Diagram (PCSpec)">
    <mxGraphModel dx="1400" dy="1400" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="1654" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- Title Header -->
        <mxCell id="title" value="Activity Diagram: ขั้นตอนการจัดสเปคคอมพิวเตอร์และการประมวลผลของระบบ (PCSpec)" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=18;fontStyle=1;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="120" y="20" width="860" height="40" as="geometry" />
        </mxCell>

        <!-- Swimlanes Container -->
        <!-- Lane 1: Customer (User) -->
        <mxCell id="lane_user" value="ผู้ใช้งาน (Customer)" style="shape=swimlane;startSize=32;fontSize=13;fontStyle=1;align=center;horizontal=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.8;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="60" y="80" width="240" height="1260" as="geometry" />
        </mxCell>

        <!-- Lane 2: Front-end (Vue.js) -->
        <mxCell id="lane_front" value="ระบบหน้าเว็บ (Vue.js Front-end)" style="shape=swimlane;startSize=32;fontSize=13;fontStyle=1;align=center;horizontal=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.8;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="300" y="80" width="270" height="1260" as="geometry" />
        </mxCell>

        <!-- Lane 3: Back-end & Database -->
        <mxCell id="lane_back" value="เซิร์ฟเวอร์ &amp; ฐานข้อมูล (Node.js &amp; MySQL)" style="shape=swimlane;startSize=32;fontSize=13;fontStyle=1;align=center;horizontal=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.8;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="570" y="80" width="270" height="1260" as="geometry" />
        </mxCell>

        <!-- Lane 4: Gemini AI -->
        <mxCell id="lane_ai" value="ปัญญาประดิษฐ์ (Google Gemini API)" style="shape=swimlane;startSize=32;fontSize=13;fontStyle=1;align=center;horizontal=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.8;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="840" y="80" width="250" height="1260" as="geometry" />
        </mxCell>

        <!-- Initial Start Node in Lane 1 -->
        <mxCell id="act_start" value="" style="ellipse;fillColor=#000000;strokeColor=#000000;" vertex="1" parent="lane_user">
          <mxGeometry x="105" y="45" width="30" height="30" as="geometry" />
        </mxCell>

        <!-- Step 1: User Opens Website -->
        <mxCell id="act_open" value="เข้าสู่เว็บไซต์จัดสเปคคอม" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=12;fontStyle=1;" vertex="1" parent="lane_user">
          <mxGeometry x="30" y="100" width="180" height="45" as="geometry" />
        </mxCell>

        <!-- Step 2: Front-end Requests Catalog -->
        <mxCell id="act_fetch" value="ส่งคำขอดึงแคตตาล็อกสินค้า" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=12;fontStyle=1;" vertex="1" parent="lane_front">
          <mxGeometry x="45" y="100" width="180" height="45" as="geometry" />
        </mxCell>

        <!-- Step 3: Back-end Queries MySQL -->
        <mxCell id="act_db" value="ดึงข้อมูลชิ้นส่วน 7 หมวดหมู่จาก MySQL" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=12;fontStyle=1;" vertex="1" parent="lane_back">
          <mxGeometry x="45" y="100" width="180" height="45" as="geometry" />
        </mxCell>

        <!-- Step 4: Front-end Renders UI -->
        <mxCell id="act_render" value="แสดงหน้ารายการอุปกรณ์ 7 หมวดหมู่" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=12;fontStyle=1;" vertex="1" parent="lane_front">
          <mxGeometry x="45" y="175" width="180" height="45" as="geometry" />
        </mxCell>

        <!-- Step 5: Decision in Lane 1 (Manual or AI) -->
        <mxCell id="act_dec_method" value="เลือกวิธีจัดสเปค?" style="rhombus;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="lane_user">
          <mxGeometry x="50" y="245" width="140" height="60" as="geometry" />
        </mxCell>

        <!-- Branch A: Manual Pick in Lane 1 -->
        <mxCell id="act_manual_pick" value="เลือกชิ้นส่วนทีละหมวดหมู่&#xa;(CPU, MB, RAM, GPU ฯลฯ)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="lane_user">
          <mxGeometry x="30" y="340" width="180" height="50" as="geometry" />
        </mxCell>

        <!-- Branch B: Ask AI in Lane 1 -->
        <mxCell id="act_ai_prompt" value="เปิดแชตบอต ระบุงบประมาณ&#xa;และลักษณะการใช้งาน" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="lane_user">
          <mxGeometry x="30" y="430" width="180" height="50" as="geometry" />
        </mxCell>

        <!-- Back-end Prepares AI Context in Lane 3 -->
        <mxCell id="act_ai_be" value="จัดเตรียม Prompt&#xa;และข้อมูลสินค้าในสต็อก" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="lane_back">
          <mxGeometry x="45" y="430" width="180" height="50" as="geometry" />
        </mxCell>

        <!-- Gemini AI Engine in Lane 4 -->
        <mxCell id="act_gemini" value="ประมวลผลแนะนำชุดสเปค&#xa;ที่เหมาะสมในรูปแบบ JSON" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="lane_ai">
          <mxGeometry x="35" y="430" width="180" height="50" as="geometry" />
        </mxCell>

        <!-- Front-end Displays AI Preset in Lane 2 -->
        <mxCell id="act_ai_show" value="แสดงข้อความตอบกลับ&#xa;และชุดสเปคที่ AI แนะนำ" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="lane_front">
          <mxGeometry x="45" y="515" width="180" height="50" as="geometry" />
        </mxCell>

        <!-- User Applies AI Preset in Lane 1 -->
        <mxCell id="act_apply_preset" value="กดปุ่มนำสเปคลงตะกร้าอัตโนมัติ" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="lane_user">
          <mxGeometry x="30" y="515" width="180" height="50" as="geometry" />
        </mxCell>

        <!-- Front-end Validates Compatibility in Lane 2 -->
        <mxCell id="act_validate" value="ตรวจสอบความเข้ากันได้แบบ Real-time:&#xa;Socket CPU, RAM Type, กำลังไฟ PSU" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="lane_front">
          <mxGeometry x="25" y="605" width="220" height="55" as="geometry" />
        </mxCell>

        <!-- Decision 2: Compatibility in Lane 2 -->
        <mxCell id="act_dec_compat" value="อุปกรณ์เข้ากันได้ไหม?" style="rhombus;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="lane_front">
          <mxGeometry x="65" y="695" width="140" height="60" as="geometry" />
        </mxCell>

        <!-- Error Warning in Lane 2 (Offset to right side of Lane 2) -->
        <mxCell id="act_warn" value="แสดงแถบแจ้งเตือนสีแดง/ส้ม&#xa;พร้อมแนะนำวิธีแก้ไข" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="lane_front">
          <mxGeometry x="45" y="785" width="180" height="48" as="geometry" />
        </mxCell>

        <!-- Success Calculation & Charts in Lane 2 -->
        <mxCell id="act_summary" value="คำนวณราคารวมและกำลังไฟรวม&#xa;พร้อมวาดกราฟสัดส่วนราคา (Chart.js)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="lane_front">
          <mxGeometry x="25" y="865" width="220" height="52" as="geometry" />
        </mxCell>

        <!-- Final Decision in Lane 1 -->
        <mxCell id="act_dec_final" value="เลือกการทำงานถัดไป" style="rhombus;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="lane_user">
          <mxGeometry x="50" y="861" width="140" height="60" as="geometry" />
        </mxCell>

        <!-- Option 1: Export PDF in Lane 2 (Y: 960) -->
        <mxCell id="act_pdf" value="สั่งพิมพ์ / บันทึกใบเสนอราคา (PDF)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="lane_front">
          <mxGeometry x="45" y="960" width="180" height="48" as="geometry" />
        </mxCell>

        <!-- Option 2: Place Order in Lane 1 (Y: 1050) -->
        <mxCell id="act_checkout" value="กรอกข้อมูลจัดส่งและยืนยันสั่งซื้อ" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="lane_user">
          <mxGeometry x="30" y="1050" width="180" height="48" as="geometry" />
        </mxCell>

        <!-- Save Order in Lane 3 (Y: 1050) -->
        <mxCell id="act_save_order" value="บันทึกคำสั่งซื้อลงตาราง orders&#xa;และสร้าง Order ID" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="lane_back">
          <mxGeometry x="45" y="1050" width="180" height="48" as="geometry" />
        </mxCell>

        <!-- End Node in Lane 2 (Y: 1160) -->
        <mxCell id="act_end" value="" style="ellipse;html=1;shape=endState;fillColor=#000000;strokeColor=#000000;" vertex="1" parent="lane_front">
          <mxGeometry x="120" y="1160" width="30" height="30" as="geometry" />
        </mxCell>

        <!-- ================= FLOW EDGES ================= -->
        <mxCell id="e1" edge="1" parent="1" source="act_start" target="act_open" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <mxCell id="e2" edge="1" parent="1" source="act_open" target="act_fetch" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <mxCell id="e3" edge="1" parent="1" source="act_fetch" target="act_db" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <mxCell id="e4" edge="1" parent="1" source="act_db" target="act_render" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;edgeStyle=orthogonalEdgeStyle;">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="705" y="277" />
              <mxPoint x="435" y="277" />
            </Array>
          </mxGeometry>
        </mxCell>

        <mxCell id="e5" edge="1" parent="1" source="act_render" target="act_dec_method" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;edgeStyle=orthogonalEdgeStyle;">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="435" y="275" />
              <mxPoint x="180" y="275" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- Decision 1 Branches -->
        <mxCell id="e6" value="[ จัดเอง ]" edge="1" parent="1" source="act_dec_method" target="act_manual_pick" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;fontSize=11;fontStyle=1;labelBackgroundColor=#ffffff;labelBorderColor=#000000;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <mxCell id="e7" value="[ ให้ AI ช่วย ]" edge="1" parent="1" source="act_dec_method" target="act_ai_prompt" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;fontSize=11;fontStyle=1;labelBackgroundColor=#ffffff;labelBorderColor=#000000;edgeStyle=orthogonalEdgeStyle;">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="70" y="355" />
              <mxPoint x="70" y="475" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- AI Path Connections -->
        <mxCell id="e8" edge="1" parent="1" source="act_ai_prompt" target="act_ai_be" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <mxCell id="e9" edge="1" parent="1" source="act_ai_be" target="act_gemini" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <mxCell id="e10" edge="1" parent="1" source="act_gemini" target="act_ai_show" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;edgeStyle=orthogonalEdgeStyle;">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="965" y="565" />
              <mxPoint x="435" y="565" />
            </Array>
          </mxGeometry>
        </mxCell>

        <mxCell id="e11" edge="1" parent="1" source="act_ai_show" target="act_apply_preset" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <mxCell id="e12" edge="1" parent="1" source="act_apply_preset" target="act_validate" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;edgeStyle=orthogonalEdgeStyle;">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="180" y="630" />
            </Array>
          </mxGeometry>
        </mxCell>

        <mxCell id="e13" edge="1" parent="1" source="act_manual_pick" target="act_validate" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;edgeStyle=orthogonalEdgeStyle;">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="250" y="395" />
              <mxPoint x="250" y="650" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- Validation & Decision 2 -->
        <mxCell id="e14" edge="1" parent="1" source="act_validate" target="act_dec_compat" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Incompatible Branch -->
        <mxCell id="e15" value="[ ไม่เข้ากัน ]" edge="1" parent="1" source="act_dec_compat" target="act_warn" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;fontSize=11;fontStyle=1;labelBackgroundColor=#ffffff;labelBorderColor=#000000;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Compatible Branch (Bypasses warn box cleanly on right side) -->
        <mxCell id="e16" value="[ เข้ากันได้ 100% ]" edge="1" parent="1" source="act_dec_compat" target="act_summary" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;fontSize=11;fontStyle=1;labelBackgroundColor=#ffffff;labelBorderColor=#000000;edgeStyle=orthogonalEdgeStyle;">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="550" y="805" />
              <mxPoint x="550" y="915" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- Loopback from Warning to Manual Pick -->
        <mxCell id="e17" edge="1" parent="1" source="act_warn" target="act_manual_pick" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;edgeStyle=orthogonalEdgeStyle;">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="320" y="839" />
              <mxPoint x="20" y="839" />
              <mxPoint x="20" y="395" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- To Final Decision -->
        <mxCell id="e18" edge="1" parent="1" source="act_summary" target="act_dec_final" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;edgeStyle=orthogonalEdgeStyle;">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="435" y="971" />
              <mxPoint x="180" y="971" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- Final Decision Option 1: PDF (Y: 960) -->
        <mxCell id="e19" value="[ พิมพ์ใบเสนอราคา ]" edge="1" parent="1" source="act_dec_final" target="act_pdf" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;fontSize=11;fontStyle=1;labelBackgroundColor=#ffffff;labelBorderColor=#000000;edgeStyle=orthogonalEdgeStyle;">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="180" y="990" />
              <mxPoint x="435" y="990" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- Final Decision Option 2: Order (Y: 1050) -->
        <mxCell id="e20" value="[ สั่งซื้อสินค้า ]" edge="1" parent="1" source="act_dec_final" target="act_checkout" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;fontSize=11;fontStyle=1;labelBackgroundColor=#ffffff;labelBorderColor=#000000;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Checkout -> Save Order (Passes below act_pdf at Y: 1100) -->
        <mxCell id="e21" edge="1" parent="1" source="act_checkout" target="act_save_order" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;edgeStyle=orthogonalEdgeStyle;">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="180" y="1124" />
              <mxPoint x="705" y="1124" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- PDF -> End Node -->
        <mxCell id="e22" edge="1" parent="1" source="act_pdf" target="act_end" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Save Order -> End Node -->
        <mxCell id="e23" edge="1" parent="1" source="act_save_order" target="act_end" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;edgeStyle=orthogonalEdgeStyle;">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="705" y="1215" />
              <mxPoint x="435" y="1215" />
            </Array>
          </mxGeometry>
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated Clean Activity Diagram at:', filePath);

  // Also update the multi-page master file
  const generateMasterScript = require('./generate_master_drawio.js');
}

generateCleanActivityDrawio();
