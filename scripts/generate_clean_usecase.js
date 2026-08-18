const fs = require('fs');

function generateCleanFlawlessUseCaseDrawio() {
  const filePath = 'C:/Users/PC/Downloads/pcspec_usecase_diagram.drawio';
  const masterFilePath = 'C:/Users/PC/Downloads/pcspec_all_system_diagrams_master.drawio';

  const xmlContent = `<mxfile host="Electron" modified="${new Date().toISOString()}" agent="PCSpec Generator" version="21.0.0" type="device">
  <diagram id="diagram_usecase" name="Use Case Diagram (PCSpec)">
    <mxGraphModel dx="1400" dy="1400" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="1654" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- Title Header -->
        <mxCell id="title" value="Use Case Diagram: ระบบจัดสเปคและประมาณราคาคอมพิวเตอร์พร้อมสเปคแชตบอตอัจฉริยะ (PCSpec)" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=18;fontStyle=1;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="80" y="20" width="1000" height="40" as="geometry" />
        </mxCell>

        <!-- System Boundary Box (Width: 700, Height: 820) -->
        <mxCell id="boundary" value="ระบบจัดสเปคคอมพิวเตอร์และแชตบอตอัจฉริยะ (PCSpec System)" style="shape=swimlane;startSize=32;fontSize=14;fontStyle=1;align=center;horizontal=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=2;fontColor=#000000;collapsible=0;" vertex="1" parent="1">
          <mxGeometry x="240" y="80" width="700" height="820" as="geometry" />
        </mxCell>

        <!-- Section Divider for Admin within Boundary -->
        <mxCell id="admin_divider" value="ส่วนงานสำหรับผู้ดูแลระบบ (Admin Management Module)" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=12;fontStyle=3;fontColor=#555555;" vertex="1" parent="boundary">
          <mxGeometry x="30" y="600" width="400" height="25" as="geometry" />
        </mxCell>
        <mxCell id="admin_line" value="" style="endArrow=none;dashed=1;html=1;strokeColor=#aaaaaa;strokeWidth=1;" edge="1" parent="boundary">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="20" y="630" />
            <mxPoint x="680" y="630" />
          </mxGeometry>
        </mxCell>

        <!-- ================= ACTORS ================= -->

        <!-- Actor 1: Customer (Left Top) -->
        <mxCell id="actor_customer" value="ผู้ใช้งานทั่วไป / ลูกค้า&#xa;(Customer)" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;strokeColor=#000000;strokeWidth=1.8;fillColor=#ffffff;fontSize=13;fontStyle=1;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="80" y="270" width="65" height="120" as="geometry" />
        </mxCell>

        <!-- Actor 2: Admin (Left Bottom) -->
        <mxCell id="actor_admin" value="ผู้ดูแลระบบ&#xa;(Admin)" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;strokeColor=#000000;strokeWidth=1.8;fillColor=#ffffff;fontSize=13;fontStyle=1;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="80" y="690" width="65" height="120" as="geometry" />
        </mxCell>

        <!-- Actor 3: Gemini AI (Right Middle) -->
        <mxCell id="actor_ai" value="&lt;&lt;Service&gt;&gt;&#xa;Google Gemini API&#xa;(LLM AI Engine)" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;strokeColor=#000000;strokeWidth=1.8;fillColor=#ffffff;fontSize=13;fontStyle=1;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="990" y="380" width="65" height="120" as="geometry" />
        </mxCell>

        <!-- ================= USE CASES (INSIDE BOUNDARY) ================= -->

        <!-- Left Column: Customer Core Features (X: 30, W: 280) -->
        
        <!-- UC 1: Register / Login -->
        <mxCell id="uc_auth" value="1. สมัครสมาชิกและเข้าสู่ระบบ&#xa;(Register / Login)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="30" y="50" width="280" height="55" as="geometry" />
        </mxCell>

        <!-- UC 2: Search & Catalog -->
        <mxCell id="uc_catalog" value="2. ค้นหาและดูแคตตาล็อกอุปกรณ์&#xa;(Search &amp; Browse Hardware)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="30" y="125" width="280" height="55" as="geometry" />
        </mxCell>

        <!-- UC 3: Manual PC Builder -->
        <mxCell id="uc_builder" value="3. จัดสเปคคอมพิวเตอร์ด้วยตนเอง&#xa;(Manual PC Builder)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="30" y="200" width="280" height="55" as="geometry" />
        </mxCell>

        <!-- UC 4: View Charts -->
        <mxCell id="uc_charts" value="4. แสดงกราฟสัดส่วนราคาและสถิติ&#xa;(View Price &amp; Spec Charts)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="30" y="280" width="280" height="55" as="geometry" />
        </mxCell>

        <!-- UC 5: Export / Print PDF -->
        <mxCell id="uc_print" value="5. พิมพ์ใบเสนอราคาและบันทึก PDF&#xa;(Export / Print Spec Sheet)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="30" y="360" width="280" height="55" as="geometry" />
        </mxCell>

        <!-- UC 6: Checkout / Order -->
        <mxCell id="uc_order" value="6. สั่งซื้อสินค้าและบันทึกคำสั่งซื้อ&#xa;(Checkout &amp; Place Order)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="30" y="440" width="280" height="55" as="geometry" />
        </mxCell>

        <!-- UC 7: Articles -->
        <mxCell id="uc_articles" value="7. อ่านบทความและข่าวสารไอที&#xa;(Read Tech News &amp; Articles)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="30" y="520" width="280" height="55" as="geometry" />
        </mxCell>

        <!-- Right Column: Sub-usecases & AI Features (X: 380, W: 290) -->

        <!-- UC 8: Check Compatibility (Include of UC3) -->
        <mxCell id="uc_compat" value="8. ตรวจสอบความเข้ากันได้ของอุปกรณ์&#xa;(Compatibility Validation)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="380" y="160" width="290" height="55" as="geometry" />
        </mxCell>

        <!-- UC 9: Calc Price & Wattage (Include of UC3) -->
        <mxCell id="uc_calc" value="9. คำนวณราคารวมและกำลังไฟรวม&#xa;(Price &amp; Wattage Calc)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="380" y="240" width="290" height="55" as="geometry" />
        </mxCell>

        <!-- UC 10: SpecAI Chatbot (Connected to Customer & Gemini) -->
        <mxCell id="uc_chatbot" value="10. สนทนาและขอคำแนะนำจัดสเปคกับ AI&#xa;(Chat with SpecAI Assistant)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="380" y="380" width="290" height="60" as="geometry" />
        </mxCell>

        <!-- UC 11: Apply Preset (Extend of UC10) -->
        <mxCell id="uc_preset" value="11. นำสเปคจาก AI ลงตะกร้าอัตโนมัติ&#xa;(Apply Preset to Builder)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="380" y="475" width="290" height="55" as="geometry" />
        </mxCell>

        <!-- Bottom Section: Admin Management Modules (Y: 650 - 740) -->

        <!-- UC 12: Admin Login -->
        <mxCell id="uc_admin_auth" value="12. เข้าสู่ระบบผู้ดูแลระบบ&#xa;(Admin Authentication)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="30" y="655" width="290" height="55" as="geometry" />
        </mxCell>

        <!-- UC 13: Admin Manage Hardware -->
        <mxCell id="uc_admin_hw" value="13. จัดการข้อมูลอุปกรณ์ (เพิ่ม/แก้ไข/ลบ)&#xa;(Manage Hardware Catalog)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="370" y="655" width="300" height="55" as="geometry" />
        </mxCell>

        <!-- UC 14: Admin Manage Orders -->
        <mxCell id="uc_admin_order" value="14. ตรวจสอบและจัดการคำสั่งซื้อ&#xa;(Manage Customer Orders)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="30" y="735" width="290" height="55" as="geometry" />
        </mxCell>

        <!-- UC 15: Admin Manage Articles -->
        <mxCell id="uc_admin_art" value="15. จัดการบทความและข่าวสารไอที&#xa;(Manage Articles &amp; News)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="370" y="735" width="300" height="55" as="geometry" />
        </mxCell>

        <!-- ================= CLEAN ACTOR CONNECTIONS ================= -->

        <!-- Customer Connections (Gentle direct rays, NO OVERLAP) -->
        <mxCell id="edge_c_auth" edge="1" parent="1" source="actor_customer" target="uc_auth" style="strokeColor=#000000;strokeWidth=1.5;endArrow=none;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="edge_c_cat" edge="1" parent="1" source="actor_customer" target="uc_catalog" style="strokeColor=#000000;strokeWidth=1.5;endArrow=none;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="edge_c_build" edge="1" parent="1" source="actor_customer" target="uc_builder" style="strokeColor=#000000;strokeWidth=1.5;endArrow=none;">
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
        <!-- Customer to Chatbot (Curved/Clean) -->
        <mxCell id="edge_c_chat" edge="1" parent="1" source="actor_customer" target="uc_chatbot" style="strokeColor=#000000;strokeWidth=1.5;endArrow=none;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Gemini AI to Chatbot (Direct Horizontal Line) -->
        <mxCell id="edge_ai_chat" edge="1" parent="1" source="actor_ai" target="uc_chatbot" style="strokeColor=#000000;strokeWidth=1.5;endArrow=none;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Admin Connections (Direct to Admin ovals, NO OVERLAP with Customer) -->
        <mxCell id="edge_a_auth" edge="1" parent="1" source="actor_admin" target="uc_admin_auth" style="strokeColor=#000000;strokeWidth=1.5;endArrow=none;">
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

        <!-- ================= RELATIONSHIPS (INCLUDE & EXTEND) ================= -->

        <!-- UC3 <<include>> UC8 (Compatibility) -->
        <mxCell id="rel_inc_compat" value="&lt;&lt;include&gt;&gt;" style="dashed=1;strokeColor=#000000;strokeWidth=1.3;fontSize=10;fontStyle=2;endArrow=open;endSize=8;html=1;labelBackgroundColor=#ffffff;labelBorderColor=#000000;" edge="1" parent="boundary" source="uc_builder" target="uc_compat">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- UC3 <<include>> UC9 (Price & Watt) -->
        <mxCell id="rel_inc_calc" value="&lt;&lt;include&gt;&gt;" style="dashed=1;strokeColor=#000000;strokeWidth=1.3;fontSize=10;fontStyle=2;endArrow=open;endSize=8;html=1;labelBackgroundColor=#ffffff;labelBorderColor=#000000;" edge="1" parent="boundary" source="uc_builder" target="uc_calc">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- UC11 <<extend>> UC10 (Apply Preset extends Chatbot) -->
        <mxCell id="rel_ext_preset" value="&lt;&lt;extend&gt;&gt;" style="dashed=1;strokeColor=#000000;strokeWidth=1.3;fontSize=10;fontStyle=2;endArrow=open;endSize=8;html=1;labelBackgroundColor=#ffffff;labelBorderColor=#000000;" edge="1" parent="boundary" source="uc_preset" target="uc_chatbot">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

  fs.writeFileSync(filePath, xmlContent, 'utf8');
  console.log('Successfully wrote Clean Balanced Use Case Diagram to:', filePath);
}

generateCleanFlawlessUseCaseDrawio();
