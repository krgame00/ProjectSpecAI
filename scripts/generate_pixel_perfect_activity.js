const fs = require('fs');
const path = require('path');

function generatePixelPerfectActivityDrawio() {
  const filePath = 'C:/Users/PC/Downloads/pcspec_activity_diagram.drawio';
  const masterFilePath = 'C:/Users/PC/Downloads/pcspec_all_system_diagrams_master.drawio';

  const xmlContent = `<mxfile host="Electron" modified="${new Date().toISOString()}" agent="PCSpec Generator" version="21.0.0" type="device">
  <diagram id="diagram_activity" name="Activity Diagram (PCSpec)">
    <mxGraphModel dx="1400" dy="1400" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="1654" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- Title Header -->
        <mxCell id="title" value="Activity Diagram: ขั้นตอนการจัดสเปคคอมพิวเตอร์และการประมวลผลของระบบ (PCSpec)" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=18;fontStyle=1;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="100" y="20" width="900" height="40" as="geometry" />
        </mxCell>

        <!-- 4 Background Swimlanes (All at parent="1", Width=250 each) -->
        <!-- Lane 1: User (60 - 310) -->
        <mxCell id="lane_user" value="ผู้ใช้งาน (Customer)" style="shape=swimlane;startSize=32;fontSize=13;fontStyle=1;align=center;horizontal=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;collapsible=0;" vertex="1" parent="1">
          <mxGeometry x="60" y="80" width="250" height="1200" as="geometry" />
        </mxCell>

        <!-- Lane 2: Front-end (310 - 560) -->
        <mxCell id="lane_front" value="ระบบหน้าเว็บ (Vue.js Front-end)" style="shape=swimlane;startSize=32;fontSize=13;fontStyle=1;align=center;horizontal=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;collapsible=0;" vertex="1" parent="1">
          <mxGeometry x="310" y="80" width="250" height="1200" as="geometry" />
        </mxCell>

        <!-- Lane 3: Back-end (560 - 810) -->
        <mxCell id="lane_back" value="เซิร์ฟเวอร์ &amp; ฐานข้อมูล (Node.js &amp; MySQL)" style="shape=swimlane;startSize=32;fontSize=13;fontStyle=1;align=center;horizontal=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;collapsible=0;" vertex="1" parent="1">
          <mxGeometry x="560" y="80" width="250" height="1200" as="geometry" />
        </mxCell>

        <!-- Lane 4: Gemini AI (810 - 1060) -->
        <mxCell id="lane_ai" value="ปัญญาประดิษฐ์ (Google Gemini API)" style="shape=swimlane;startSize=32;fontSize=13;fontStyle=1;align=center;horizontal=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;collapsible=0;" vertex="1" parent="1">
          <mxGeometry x="810" y="80" width="250" height="1200" as="geometry" />
        </mxCell>

        <!-- ================= ALL NODES (Parent=1, Absolute Coordinates) ================= -->
        
        <!-- Start Node in Lane 1 (Center = 185) -->
        <mxCell id="act_start" value="" style="ellipse;fillColor=#000000;strokeColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="170" y="130" width="30" height="30" as="geometry" />
        </mxCell>

        <!-- 1. Open Web (Lane 1, X: 85, W: 200) -->
        <mxCell id="act_open" value="เข้าสู่เว็บไซต์จัดสเปคคอม" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=12;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="85" y="190" width="200" height="45" as="geometry" />
        </mxCell>

        <!-- 2. Fetch Catalog (Lane 2, X: 335, W: 200) -->
        <mxCell id="act_fetch" value="ส่งคำขอดึงแคตตาล็อกสินค้า" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=12;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="335" y="190" width="200" height="45" as="geometry" />
        </mxCell>

        <!-- 3. Query DB (Lane 3, X: 585, W: 200) -->
        <mxCell id="act_db" value="ดึงข้อมูลชิ้นส่วน 7 หมวดหมู่จาก MySQL" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=12;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="585" y="190" width="200" height="45" as="geometry" />
        </mxCell>

        <!-- 4. Render Catalog (Lane 2, X: 335, W: 200) -->
        <mxCell id="act_render" value="แสดงหน้ารายการอุปกรณ์ 7 หมวดหมู่" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=12;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="335" y="265" width="200" height="45" as="geometry" />
        </mxCell>

        <!-- 5. Decision: Method (Lane 1, X: 110, W: 150) -->
        <mxCell id="act_dec_method" value="เลือกวิธีจัดสเปค?" style="rhombus;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="110" y="340" width="150" height="60" as="geometry" />
        </mxCell>

        <!-- 6A. Manual Pick (Lane 1, X: 85, W: 200) -->
        <mxCell id="act_manual_pick" value="เลือกชิ้นส่วนทีละหมวดหมู่&#xa;(CPU, MB, RAM, GPU ฯลฯ)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="85" y="435" width="200" height="48" as="geometry" />
        </mxCell>

        <!-- 6B. Prompt AI (Lane 1, X: 85, W: 200) -->
        <mxCell id="act_ai_prompt" value="เปิดแชตบอต ระบุงบประมาณ&#xa;และลักษณะการใช้งาน" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="85" y="520" width="200" height="48" as="geometry" />
        </mxCell>

        <!-- 7. Backend Prep AI (Lane 3, X: 585, W: 200) -->
        <mxCell id="act_ai_be" value="จัดเตรียม Prompt&#xa;และข้อมูลสินค้าในสต็อก" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="585" y="520" width="200" height="48" as="geometry" />
        </mxCell>

        <!-- 8. Gemini Engine (Lane 4, X: 835, W: 200) -->
        <mxCell id="act_gemini" value="ประมวลผลแนะนำชุดสเปค&#xa;ที่เหมาะสมในรูปแบบ JSON" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="835" y="520" width="200" height="48" as="geometry" />
        </mxCell>

        <!-- 9. Frontend Shows AI Spec (Lane 2, X: 335, W: 200) -->
        <mxCell id="act_ai_show" value="แสดงข้อความตอบกลับ&#xa;และชุดสเปคที่ AI แนะนำ" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="335" y="595" width="200" height="48" as="geometry" />
        </mxCell>

        <!-- 10. User Applies Preset (Lane 1, X: 85, W: 200) -->
        <mxCell id="act_apply_preset" value="กดปุ่มนำสเปคลงตะกร้าอัตโนมัติ" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="85" y="595" width="200" height="48" as="geometry" />
        </mxCell>

        <!-- 11. Compatibility Validation (Lane 2, X: 335, W: 200) -->
        <mxCell id="act_validate" value="ตรวจสอบความเข้ากันได้ Real-time:&#xa;Socket, RAM Type, วัตต์ไฟ PSU" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="335" y="675" width="200" height="50" as="geometry" />
        </mxCell>

        <!-- 12. Decision: Compatibility (Lane 2, X: 360, W: 150) -->
        <mxCell id="act_dec_compat" value="อุปกรณ์เข้ากันได้ไหม?" style="rhombus;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="360" y="755" width="150" height="60" as="geometry" />
        </mxCell>

        <!-- 13. Error Warning (Lane 2, X: 335, W: 200) -->
        <mxCell id="act_warn" value="แสดงแถบแจ้งเตือนสีแดง/ส้ม&#xa;พร้อมแนะนำวิธีแก้ไข" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="335" y="845" width="200" height="45" as="geometry" />
        </mxCell>

        <!-- 14. Success Calc & Chart (Lane 2, X: 335, W: 200) -->
        <mxCell id="act_summary" value="คำนวณราคารวมและกำลังไฟรวม&#xa;พร้อมแสดงกราฟราคา (Chart.js)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="335" y="925" width="200" height="48" as="geometry" />
        </mxCell>

        <!-- 15. Decision: Final Choice (Lane 1, X: 110, W: 150) -->
        <mxCell id="act_dec_final" value="เลือกการทำงานถัดไป" style="rhombus;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="110" y="919" width="150" height="60" as="geometry" />
        </mxCell>

        <!-- 16. Option 1: PDF (Lane 2, X: 335, W: 200) -->
        <mxCell id="act_pdf" value="สั่งพิมพ์ / บันทึกใบเสนอราคา (PDF)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="335" y="1005" width="200" height="45" as="geometry" />
        </mxCell>

        <!-- 17. Option 2: Checkout (Lane 1, X: 85, W: 200) -->
        <mxCell id="act_checkout" value="กรอกข้อมูลจัดส่งและยืนยันสั่งซื้อ" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="85" y="1085" width="200" height="45" as="geometry" />
        </mxCell>

        <!-- 18. Save Order in MySQL (Lane 3, X: 585, W: 200) -->
        <mxCell id="act_save_order" value="บันทึกคำสั่งซื้อลงตาราง orders&#xa;และสร้าง Order ID" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="585" y="1085" width="200" height="45" as="geometry" />
        </mxCell>

        <!-- 19. End State Node (Lane 2, Center = 435) -->
        <mxCell id="act_end" value="" style="ellipse;html=1;shape=endState;fillColor=#000000;strokeColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="420" y="1180" width="30" height="30" as="geometry" />
        </mxCell>

        <!-- ================= EXPLICIT CLEAN FLOW EDGES ================= -->
        
        <!-- Start -> Open -->
        <mxCell id="e1" edge="1" parent="1" source="act_start" target="act_open" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Open -> Fetch -->
        <mxCell id="e2" edge="1" parent="1" source="act_open" target="act_fetch" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Fetch -> DB -->
        <mxCell id="e3" edge="1" parent="1" source="act_fetch" target="act_db" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- DB -> Render -->
        <mxCell id="e4" edge="1" parent="1" source="act_db" target="act_render" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;edgeStyle=orthogonalEdgeStyle;exitX=0.5;exitY=1;entryX=1;entryY=0.5;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Render -> Decision Method -->
        <mxCell id="e5" edge="1" parent="1" source="act_render" target="act_dec_method" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;edgeStyle=orthogonalEdgeStyle;exitX=0;exitY=0.5;entryX=0.5;entryY=0;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Decision -> Manual Pick -->
        <mxCell id="e6" value="[ จัดเอง ]" edge="1" parent="1" source="act_dec_method" target="act_manual_pick" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;fontSize=11;fontStyle=1;labelBackgroundColor=#ffffff;labelBorderColor=#000000;exitX=0.5;exitY=1;entryX=0.5;entryY=0;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Decision -> AI Prompt (Looping cleanly inside Lane 1) -->
        <mxCell id="e7" value="[ ให้ AI ช่วย ]" edge="1" parent="1" source="act_dec_method" target="act_ai_prompt" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;fontSize=11;fontStyle=1;labelBackgroundColor=#ffffff;labelBorderColor=#000000;edgeStyle=orthogonalEdgeStyle;exitX=0;exitY=0.5;entryX=0;entryY=0.5;">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="75" y="370" />
              <mxPoint x="75" y="544" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- AI Prompt -> Backend Prep -->
        <mxCell id="e8" edge="1" parent="1" source="act_ai_prompt" target="act_ai_be" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;exitX=1;exitY=0.5;entryX=0;entryY=0.5;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Backend Prep -> Gemini -->
        <mxCell id="e9" edge="1" parent="1" source="act_ai_be" target="act_gemini" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;exitX=1;exitY=0.5;entryX=0;entryY=0.5;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Gemini -> Show AI Spec -->
        <mxCell id="e10" edge="1" parent="1" source="act_gemini" target="act_ai_show" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;edgeStyle=orthogonalEdgeStyle;exitX=0.5;exitY=1;entryX=1;entryY=0.5;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Show AI Spec -> Apply Preset -->
        <mxCell id="e11" edge="1" parent="1" source="act_ai_show" target="act_apply_preset" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;exitX=0;exitY=0.5;entryX=1;entryY=0.5;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Apply Preset -> Validation -->
        <mxCell id="e12" edge="1" parent="1" source="act_apply_preset" target="act_validate" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;edgeStyle=orthogonalEdgeStyle;exitX=0.5;exitY=1;entryX=0;entryY=0.5;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Manual Pick -> Validation -->
        <mxCell id="e13" edge="1" parent="1" source="act_manual_pick" target="act_validate" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;edgeStyle=orthogonalEdgeStyle;exitX=1;exitY=0.5;entryX=0.5;entryY=0;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Validation -> Compatibility Decision -->
        <mxCell id="e14" edge="1" parent="1" source="act_validate" target="act_dec_compat" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;exitX=0.5;exitY=1;entryX=0.5;entryY=0;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Incompatible -> Warning Alert -->
        <mxCell id="e15" value="[ ไม่เข้ากัน ]" edge="1" parent="1" source="act_dec_compat" target="act_warn" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;fontSize=11;fontStyle=1;labelBackgroundColor=#ffffff;labelBorderColor=#000000;exitX=0.5;exitY=1;entryX=0.5;entryY=0;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Warning Loopback to Manual Pick -->
        <mxCell id="e16" edge="1" parent="1" source="act_warn" target="act_manual_pick" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;edgeStyle=orthogonalEdgeStyle;exitX=0;exitY=0.5;entryX=0.5;entryY=1;">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="185" y="867" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- Compatible 100% -> Summary Calc & Charts -->
        <mxCell id="e17" value="[ เข้ากันได้ 100% ]" edge="1" parent="1" source="act_dec_compat" target="act_summary" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;fontSize=11;fontStyle=1;labelBackgroundColor=#ffffff;labelBorderColor=#000000;edgeStyle=orthogonalEdgeStyle;exitX=1;exitY=0.5;entryX=1;entryY=0.5;">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="545" y="785" />
              <mxPoint x="545" y="949" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- Summary -> Final Decision -->
        <mxCell id="e18" edge="1" parent="1" source="act_summary" target="act_dec_final" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;exitX=0;exitY=0.5;entryX=1;entryY=0.5;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Final Decision -> Option 1: PDF -->
        <mxCell id="e19" value="[ พิมพ์ใบเสนอราคา ]" edge="1" parent="1" source="act_dec_final" target="act_pdf" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;fontSize=11;fontStyle=1;labelBackgroundColor=#ffffff;labelBorderColor=#000000;edgeStyle=orthogonalEdgeStyle;exitX=0.5;exitY=1;entryX=0;entryY=0.5;">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="185" y="1028" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- Final Decision -> Option 2: Checkout -->
        <mxCell id="e20" value="[ สั่งซื้อสินค้า ]" edge="1" parent="1" source="act_dec_final" target="act_checkout" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;fontSize=11;fontStyle=1;labelBackgroundColor=#ffffff;labelBorderColor=#000000;edgeStyle=orthogonalEdgeStyle;exitX=0;exitY=0.5;entryX=0.5;entryY=0;">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="75" y="949" />
              <mxPoint x="75" y="1065" />
              <mxPoint x="185" y="1065" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- Checkout -> Save Order -->
        <mxCell id="e21" edge="1" parent="1" source="act_checkout" target="act_save_order" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;exitX=1;exitY=0.5;entryX=0;entryY=0.5;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- PDF -> End Node -->
        <mxCell id="e22" edge="1" parent="1" source="act_pdf" target="act_end" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;exitX=0.5;exitY=1;entryX=0.5;entryY=0;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Save Order -> End Node -->
        <mxCell id="e23" edge="1" parent="1" source="act_save_order" target="act_end" style="strokeColor=#000000;strokeWidth=1.5;endArrow=open;endSize=8;edgeStyle=orthogonalEdgeStyle;exitX=0.5;exitY=1;entryX=1;entryY=0.5;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

  fs.writeFileSync(filePath, xmlContent, 'utf8');
  console.log('Created Pixel-Perfect Activity Diagram at:', filePath);
}

generatePixelPerfectActivityDrawio();
