const fs = require('fs');

function generateNumberedFreeCleanUseCaseDrawio() {
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
          <mxGeometry x="80" y="20" width="1020" height="40" as="geometry" />
        </mxCell>

        <!-- System Boundary Box (Width: 720, Height: 830) -->
        <mxCell id="boundary" value="ระบบจัดสเปคคอมพิวเตอร์และแชตบอตอัจฉริยะ (PCSpec System)" style="shape=swimlane;startSize=32;fontSize=14;fontStyle=1;align=center;horizontal=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=2;fontColor=#000000;collapsible=0;" vertex="1" parent="1">
          <mxGeometry x="250" y="80" width="720" height="830" as="geometry" />
        </mxCell>

        <!-- ================= ACTORS (Placed with plenty of clear spacing) ================= -->

        <!-- Actor 1: Customer (Left Top, Center Y = 320) -->
        <mxCell id="actor_customer" value="ผู้ใช้งานทั่วไป / ลูกค้า&#xa;(Customer)" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;strokeColor=#000000;strokeWidth=1.8;fillColor=#ffffff;fontSize=13;fontStyle=1;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="70" y="260" width="65" height="120" as="geometry" />
        </mxCell>

        <!-- Actor 2: Admin (Left Bottom, Center Y = 740) -->
        <mxCell id="actor_admin" value="ผู้ดูแลระบบ&#xa;(Admin)" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;strokeColor=#000000;strokeWidth=1.8;fillColor=#ffffff;fontSize=13;fontStyle=1;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="70" y="680" width="65" height="120" as="geometry" />
        </mxCell>

        <!-- Actor 3: Gemini AI (Right Middle, Center Y = 410) -->
        <mxCell id="actor_ai" value="&lt;&lt;Service&gt;&gt;&#xa;Google Gemini API&#xa;(LLM AI Engine)" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;strokeColor=#000000;strokeWidth=1.8;fillColor=#ffffff;fontSize=13;fontStyle=1;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="1030" y="350" width="65" height="120" as="geometry" />
        </mxCell>

        <!-- ================= USE CASES (NO NUMBERS, AMPLE SPACING) ================= -->

        <!-- Left Column: Customer Features (X: 30, W: 290) -->
        
        <!-- Register / Login -->
        <mxCell id="uc_auth" value="สมัครสมาชิกและเข้าสู่ระบบ&#xa;(Register / Login)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="30" y="50" width="290" height="52" as="geometry" />
        </mxCell>

        <!-- Search & Catalog -->
        <mxCell id="uc_catalog" value="ค้นหาและดูแคตตาล็อกอุปกรณ์&#xa;(Search &amp; Browse Hardware)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="30" y="125" width="290" height="52" as="geometry" />
        </mxCell>

        <!-- Manual PC Builder -->
        <mxCell id="uc_builder" value="จัดสเปคคอมพิวเตอร์ด้วยตนเอง&#xa;(Manual PC Builder)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="30" y="200" width="290" height="52" as="geometry" />
        </mxCell>

        <!-- View Charts -->
        <mxCell id="uc_charts" value="แสดงกราฟสัดส่วนราคาและสถิติ&#xa;(View Price &amp; Spec Charts)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="30" y="280" width="290" height="52" as="geometry" />
        </mxCell>

        <!-- Export / Print PDF -->
        <mxCell id="uc_print" value="พิมพ์ใบเสนอราคาและบันทึก PDF&#xa;(Export / Print Spec Sheet)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="30" y="360" width="290" height="52" as="geometry" />
        </mxCell>

        <!-- Checkout / Order -->
        <mxCell id="uc_order" value="สั่งซื้อสินค้าและบันทึกคำสั่งซื้อ&#xa;(Checkout &amp; Place Order)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="30" y="440" width="290" height="52" as="geometry" />
        </mxCell>

        <!-- Articles -->
        <mxCell id="uc_articles" value="อ่านบทความและข่าวสารไอที&#xa;(Read Tech News &amp; Articles)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="30" y="520" width="290" height="52" as="geometry" />
        </mxCell>

        <!-- Right Column: Sub-usecases & AI Features (X: 390, W: 300) -->

        <!-- Check Compatibility (Include of Builder) -->
        <mxCell id="uc_compat" value="ตรวจสอบความเข้ากันได้ของอุปกรณ์&#xa;(Compatibility Validation)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="390" y="160" width="300" height="52" as="geometry" />
        </mxCell>

        <!-- Calc Price & Wattage (Include of Builder) -->
        <mxCell id="uc_calc" value="คำนวณราคารวมและกำลังไฟรวม&#xa;(Price &amp; Wattage Calc)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="390" y="240" width="300" height="52" as="geometry" />
        </mxCell>

        <!-- SpecAI Chatbot (Connected to Customer & Gemini) -->
        <mxCell id="uc_chatbot" value="สนทนาและขอคำแนะนำจัดสเปคกับ AI&#xa;(Chat with SpecAI Assistant)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="390" y="380" width="300" height="58" as="geometry" />
        </mxCell>

        <!-- Apply Preset (Extend of Chatbot) -->
        <mxCell id="uc_preset" value="นำสเปคจาก AI ลงตะกร้าอัตโนมัติ&#xa;(Apply Preset to Builder)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="390" y="475" width="300" height="52" as="geometry" />
        </mxCell>

        <!-- Bottom Section: Admin Modules (Y: 650 - 750) -->

        <!-- Admin Login -->
        <mxCell id="uc_admin_auth" value="เข้าสู่ระบบผู้ดูแลระบบ&#xa;(Admin Authentication)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="30" y="660" width="290" height="52" as="geometry" />
        </mxCell>

        <!-- Admin Manage Hardware -->
        <mxCell id="uc_admin_hw" value="จัดการข้อมูลอุปกรณ์ (เพิ่ม/แก้ไข/ลบ)&#xa;(Manage Hardware Catalog)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="390" y="660" width="300" height="52" as="geometry" />
        </mxCell>

        <!-- Admin Manage Orders -->
        <mxCell id="uc_admin_order" value="ตรวจสอบและจัดการคำสั่งซื้อ&#xa;(Manage Customer Orders)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="30" y="740" width="290" height="52" as="geometry" />
        </mxCell>

        <!-- Admin Manage Articles -->
        <mxCell id="uc_admin_art" value="จัดการบทความและข่าวสารไอที&#xa;(Manage Articles &amp; News)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1.5;fontSize=11;fontStyle=1;fontColor=#000000;" vertex="1" parent="boundary">
          <mxGeometry x="390" y="740" width="300" height="52" as="geometry" />
        </mxCell>

        <!-- ================= CLEAN NON-OVERLAPPING CONNECTIONS ================= -->

        <!-- Customer Connections (Enter exact left point of each oval) -->
        <mxCell id="edge_c_auth" edge="1" parent="1" source="actor_customer" target="uc_auth" style="strokeColor=#000000;strokeWidth=1.5;endArrow=none;exitX=1;exitY=0.3;entryX=0;entryY=0.5;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="edge_c_cat" edge="1" parent="1" source="actor_customer" target="uc_catalog" style="strokeColor=#000000;strokeWidth=1.5;endArrow=none;exitX=1;exitY=0.35;entryX=0;entryY=0.5;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="edge_c_build" edge="1" parent="1" source="actor_customer" target="uc_builder" style="strokeColor=#000000;strokeWidth=1.5;endArrow=none;exitX=1;exitY=0.45;entryX=0;entryY=0.5;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="edge_c_charts" edge="1" parent="1" source="actor_customer" target="uc_charts" style="strokeColor=#000000;strokeWidth=1.5;endArrow=none;exitX=1;exitY=0.55;entryX=0;entryY=0.5;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="edge_c_print" edge="1" parent="1" source="actor_customer" target="uc_print" style="strokeColor=#000000;strokeWidth=1.5;endArrow=none;exitX=1;exitY=0.65;entryX=0;entryY=0.5;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="edge_c_order" edge="1" parent="1" source="actor_customer" target="uc_order" style="strokeColor=#000000;strokeWidth=1.5;endArrow=none;exitX=1;exitY=0.75;entryX=0;entryY=0.5;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="edge_c_art" edge="1" parent="1" source="actor_customer" target="uc_articles" style="strokeColor=#000000;strokeWidth=1.5;endArrow=none;exitX=1;exitY=0.85;entryX=0;entryY=0.5;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        
        <!-- Customer to Chatbot (Direct straight line through open middle gap) -->
        <mxCell id="edge_c_chat" edge="1" parent="1" source="actor_customer" target="uc_chatbot" style="strokeColor=#000000;strokeWidth=1.5;endArrow=none;exitX=1;exitY=0.5;entryX=0;entryY=0.5;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Gemini AI to Chatbot (Direct horizontal line to right edge of chatbot) -->
        <mxCell id="edge_ai_chat" edge="1" parent="1" source="actor_ai" target="uc_chatbot" style="strokeColor=#000000;strokeWidth=1.5;endArrow=none;exitX=0;exitY=0.5;entryX=1;entryY=0.5;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Admin Connections (Direct to Admin ovals with clean exit points) -->
        <mxCell id="edge_a_auth" edge="1" parent="1" source="actor_admin" target="uc_admin_auth" style="strokeColor=#000000;strokeWidth=1.5;endArrow=none;exitX=1;exitY=0.35;entryX=0;entryY=0.5;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="edge_a_hw" edge="1" parent="1" source="actor_admin" target="uc_admin_hw" style="strokeColor=#000000;strokeWidth=1.5;endArrow=none;exitX=1;exitY=0.45;entryX=0;entryY=0.5;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="edge_a_order" edge="1" parent="1" source="actor_admin" target="uc_admin_order" style="strokeColor=#000000;strokeWidth=1.5;endArrow=none;exitX=1;exitY=0.65;entryX=0;entryY=0.5;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="edge_a_art" edge="1" parent="1" source="actor_admin" target="uc_admin_art" style="strokeColor=#000000;strokeWidth=1.5;endArrow=none;exitX=1;exitY=0.75;entryX=0;entryY=0.5;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- ================= RELATIONSHIPS (INCLUDE & EXTEND) ================= -->

        <!-- Builder <<include>> Compatibility -->
        <mxCell id="rel_inc_compat" value="&lt;&lt;include&gt;&gt;" style="dashed=1;strokeColor=#000000;strokeWidth=1.3;fontSize=10;fontStyle=2;endArrow=open;endSize=8;html=1;labelBackgroundColor=#ffffff;labelBorderColor=#000000;exitX=1;exitY=0.3;entryX=0;entryY=0.5;" edge="1" parent="boundary" source="uc_builder" target="uc_compat">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Builder <<include>> Price & Watt -->
        <mxCell id="rel_inc_calc" value="&lt;&lt;include&gt;&gt;" style="dashed=1;strokeColor=#000000;strokeWidth=1.3;fontSize=10;fontStyle=2;endArrow=open;endSize=8;html=1;labelBackgroundColor=#ffffff;labelBorderColor=#000000;exitX=1;exitY=0.7;entryX=0;entryY=0.5;" edge="1" parent="boundary" source="uc_builder" target="uc_calc">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Apply Preset <<extend>> Chatbot -->
        <mxCell id="rel_ext_preset" value="&lt;&lt;extend&gt;&gt;" style="dashed=1;strokeColor=#000000;strokeWidth=1.3;fontSize=10;fontStyle=2;endArrow=open;endSize=8;html=1;labelBackgroundColor=#ffffff;labelBorderColor=#000000;exitX=0.5;exitY=0;entryX=0.5;entryY=1;" edge="1" parent="boundary" source="uc_preset" target="uc_chatbot">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

  fs.writeFileSync(filePath, xmlContent, 'utf8');
  console.log('Successfully generated Clean Non-Numbered Use Case Diagram at:', filePath);
}

generateNumberedFreeCleanUseCaseDrawio();
