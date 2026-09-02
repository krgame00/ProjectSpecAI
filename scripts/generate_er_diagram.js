const fs = require('fs');
const path = require('path');

const drawioDir = path.join(__dirname, '..', 'docs', 'drawio');
const svgDir = path.join(__dirname, '..', 'docs');
const downloadMaster1 = 'C:/Users/PC/Downloads/pcspec_all_system_diagrams_master (1).drawio';
const downloadMaster2 = 'C:/Users/PC/Downloads/pcspec_all_system_diagrams_master (2).drawio';
const downloadMaster = 'C:/Users/PC/Downloads/pcspec_all_system_diagrams_master.drawio';
const downloadDrawioPath = 'C:/Users/PC/Downloads/smart_pc_builder_er_diagram.drawio';

if (!fs.existsSync(drawioDir)) fs.mkdirSync(drawioDir, { recursive: true });
if (!fs.existsSync(svgDir)) fs.mkdirSync(svgDir, { recursive: true });

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const tables = [
  // 1. Users (ตารางผู้ใช้งานระบบ - ลูกค้า & สมาชิก)
  {
    id: 'tbl_users',
    name: 'users',
    x: 40, y: 70, w: 240,
    columns: [
      { key: 'PK', name: 'id', type: 'INT' },
      { key: ' ', name: 'name', type: 'VARCHAR(100)' },
      { key: 'UQ', name: 'email', type: 'VARCHAR(100)' },
      { key: ' ', name: 'password', type: 'VARCHAR(255)' },
      { key: ' ', name: 'role', type: 'VARCHAR(20)' },
      { key: ' ', name: 'created_at', type: 'TIMESTAMP' }
    ]
  },
  // 2. Admins (ตารางข้อมูลผู้ดูแลระบบโดยเฉพาะ)
  {
    id: 'tbl_admins',
    name: 'admins',
    x: 40, y: 290, w: 240,
    columns: [
      { key: 'PK', name: 'id', type: 'INT' },
      { key: 'FK,UQ', name: 'user_id', type: 'INT' },
      { key: ' ', name: 'admin_code', type: 'VARCHAR(50)' },
      { key: ' ', name: 'role_level', type: 'VARCHAR(50)' },
      { key: ' ', name: 'department', type: 'VARCHAR(100)' },
      { key: ' ', name: 'created_at', type: 'TIMESTAMP' }
    ]
  },
  // 3. Admin Logs (ประวัติการดำเนินการของแอดมิน)
  {
    id: 'tbl_admin_logs',
    name: 'admin_logs',
    x: 40, y: 510, w: 240,
    columns: [
      { key: 'PK', name: 'id', type: 'INT' },
      { key: 'FK', name: 'admin_id', type: 'INT' },
      { key: ' ', name: 'action', type: 'VARCHAR(50)' },
      { key: ' ', name: 'target_table', type: 'VARCHAR(50)' },
      { key: ' ', name: 'target_id', type: 'VARCHAR(50)' },
      { key: ' ', name: 'details', type: 'TEXT' },
      { key: ' ', name: 'created_at', type: 'TIMESTAMP' }
    ]
  },
  // 4. Articles (บทความและข่าวสารไอที จัดการโดย Admin)
  {
    id: 'tbl_articles',
    name: 'articles',
    x: 40, y: 760, w: 240,
    columns: [
      { key: 'PK', name: 'id', type: 'INT' },
      { key: 'FK', name: 'admin_id', type: 'INT' },
      { key: ' ', name: 'title', type: 'VARCHAR(255)' },
      { key: ' ', name: 'content', type: 'TEXT' },
      { key: ' ', name: 'image_url', type: 'VARCHAR(255)' },
      { key: ' ', name: 'created_at', type: 'TIMESTAMP' }
    ]
  },
  // 5. Orders (คำสั่งซื้อของลูกค้า - ตรวจสอบและอัปเดตสถานะโดย Admin)
  {
    id: 'tbl_orders',
    name: 'orders',
    x: 380, y: 70, w: 270,
    columns: [
      { key: 'PK', name: 'id', type: 'VARCHAR(50)' },
      { key: 'FK', name: 'user_id', type: 'INT' },
      { key: 'FK', name: 'admin_id', type: 'INT' },
      { key: ' ', name: 'customer_name', type: 'VARCHAR(100)' },
      { key: ' ', name: 'customer_address', type: 'TEXT' },
      { key: ' ', name: 'customer_phone', type: 'VARCHAR(20)' },
      { key: ' ', name: 'assembly_type', type: 'VARCHAR(50)' },
      { key: ' ', name: 'total_price', type: 'DECIMAL(10,2)' },
      { key: ' ', name: 'status', type: 'VARCHAR(50)' },
      { key: ' ', name: 'created_at', type: 'TIMESTAMP' }
    ]
  },
  // 6. Categories (หมวดหมู่อุปกรณ์ - จัดการโดย Admin)
  {
    id: 'tbl_categories',
    name: 'categories',
    x: 380, y: 390, w: 270,
    columns: [
      { key: 'PK', name: 'id', type: 'INT' },
      { key: 'FK', name: 'admin_id', type: 'INT' },
      { key: 'UQ', name: 'slug', type: 'VARCHAR(50)' },
      { key: ' ', name: 'name_th', type: 'VARCHAR(100)' },
      { key: ' ', name: 'description', type: 'TEXT' },
      { key: ' ', name: 'created_at', type: 'TIMESTAMP' }
    ]
  },
  // 7. Products (ข้อมูลอุปกรณ์คอมพิวเตอร์ - จัดการสต็อก/ราคาโดย Admin)
  {
    id: 'tbl_products',
    name: 'products',
    x: 380, y: 610, w: 270,
    columns: [
      { key: 'PK', name: 'id', type: 'INT' },
      { key: 'FK', name: 'category_id', type: 'INT' },
      { key: 'FK', name: 'admin_id', type: 'INT' },
      { key: ' ', name: 'brand', type: 'VARCHAR(100)' },
      { key: ' ', name: 'model', type: 'VARCHAR(255)' },
      { key: ' ', name: 'price', type: 'DECIMAL(10,2)' },
      { key: ' ', name: 'image_url', type: 'VARCHAR(255)' },
      { key: ' ', name: 'stock_quantity', type: 'INT' },
      { key: ' ', name: 'specifications', type: 'JSON' },
      { key: ' ', name: 'created_at', type: 'TIMESTAMP' }
    ]
  },
  // 8. Spec Case
  {
    id: 'tbl_spec_case',
    name: 'spec_case',
    x: 380, y: 930, w: 270,
    columns: [
      { key: 'PK,FK', name: 'product_id', type: 'INT' },
      { key: ' ', name: 'form_factor_support', type: 'VARCHAR(255)' }
    ]
  },
  // 9. Order Items (รายการสินค้าในคำสั่งซื้อ)
  {
    id: 'tbl_order_items',
    name: 'order_items',
    x: 750, y: 70, w: 240,
    columns: [
      { key: 'PK', name: 'id', type: 'INT' },
      { key: 'FK', name: 'order_id', type: 'VARCHAR(50)' },
      { key: 'FK', name: 'product_id', type: 'INT' },
      { key: ' ', name: 'category_slug', type: 'VARCHAR(50)' },
      { key: ' ', name: 'price', type: 'DECIMAL(10,2)' }
    ]
  },
  // 10. Spec CPU
  {
    id: 'tbl_spec_cpu',
    name: 'spec_cpu',
    x: 750, y: 270, w: 240,
    columns: [
      { key: 'PK,FK', name: 'product_id', type: 'INT' },
      { key: ' ', name: 'socket', type: 'VARCHAR(50)' },
      { key: ' ', name: 'tdp_watt', type: 'INT' }
    ]
  },
  // 11. Spec Motherboard
  {
    id: 'tbl_spec_mobo',
    name: 'spec_motherboard',
    x: 750, y: 395, w: 240,
    columns: [
      { key: 'PK,FK', name: 'product_id', type: 'INT' },
      { key: ' ', name: 'socket', type: 'VARCHAR(50)' },
      { key: ' ', name: 'ram_type', type: 'VARCHAR(20)' }
    ]
  },
  // 12. Spec RAM
  {
    id: 'tbl_spec_ram',
    name: 'spec_ram',
    x: 750, y: 520, w: 240,
    columns: [
      { key: 'PK,FK', name: 'product_id', type: 'INT' },
      { key: ' ', name: 'ram_type', type: 'VARCHAR(20)' },
      { key: ' ', name: 'capacity_gb', type: 'INT' }
    ]
  },
  // 13. Spec GPU
  {
    id: 'tbl_spec_gpu',
    name: 'spec_gpu',
    x: 750, y: 645, w: 240,
    columns: [
      { key: 'PK,FK', name: 'product_id', type: 'INT' },
      { key: ' ', name: 'tdp_watt', type: 'INT' }
    ]
  },
  // 14. Spec Storage
  {
    id: 'tbl_spec_storage',
    name: 'spec_storage',
    x: 750, y: 745, w: 240,
    columns: [
      { key: 'PK,FK', name: 'product_id', type: 'INT' },
      { key: ' ', name: 'type', type: 'VARCHAR(50)' },
      { key: ' ', name: 'capacity_gb', type: 'INT' }
    ]
  },
  // 15. Spec PSU
  {
    id: 'tbl_spec_psu',
    name: 'spec_psu',
    x: 750, y: 865, w: 240,
    columns: [
      { key: 'PK,FK', name: 'product_id', type: 'INT' },
      { key: ' ', name: 'wattage', type: 'INT' }
    ]
  }
];

const relationships = [
  // 1. Users -> Admins (1 : 1) Supertype/Subtype
  { from: 'tbl_users', to: 'tbl_admins', isOneToMany: false, exitX: 0.5, exitY: 1, entryX: 0.5, entryY: 0 },
  // 2. Users (Customer) -> Orders (1 : N)
  { from: 'tbl_users', to: 'tbl_orders', isOneToMany: true, exitX: 1, exitY: 0.25, entryX: 0, entryY: 0.15 },
  // 3. Admins -> Orders (1 : N) [Admin manages/approves orders]
  { from: 'tbl_admins', to: 'tbl_orders', isOneToMany: true, exitX: 1, exitY: 0.25, entryX: 0, entryY: 0.35 },
  // 4. Admins -> Categories (1 : N) [Admin manages categories]
  { from: 'tbl_admins', to: 'tbl_categories', isOneToMany: true, exitX: 1, exitY: 0.55, entryX: 0, entryY: 0.3 },
  // 5. Admins -> Products (1 : N) [Admin manages hardware catalog]
  { from: 'tbl_admins', to: 'tbl_products', isOneToMany: true, exitX: 1, exitY: 0.85, entryX: 0, entryY: 0.3 },
  // 6. Admins -> Admin Logs (1 : N) [Admin operation audit log]
  { from: 'tbl_admins', to: 'tbl_admin_logs', isOneToMany: true, exitX: 0.5, exitY: 1, entryX: 0.5, entryY: 0 },
  // 7. Admins -> Articles (1 : N) [Admin writes & manages articles]
  { from: 'tbl_admins', to: 'tbl_articles', isOneToMany: true, exitX: 0, exitY: 0.7, entryX: 0, entryY: 0.3, points: [[15, 420], [15, 815]] },
  // 8. Orders -> Order Items (1 : N)
  { from: 'tbl_orders', to: 'tbl_order_items', isOneToMany: true, exitX: 1, exitY: 0.15, entryX: 0, entryY: 0.25 },
  // 9. Categories -> Products (1 : N)
  { from: 'tbl_categories', to: 'tbl_products', isOneToMany: true, exitX: 0.5, exitY: 1, entryX: 0.5, entryY: 0 },
  // 10. Products -> Order Items (1 : N)
  { from: 'tbl_products', to: 'tbl_order_items', isOneToMany: true, exitX: 1, exitY: 0.08, entryX: 0, entryY: 0.75 },
  // 11. Products -> Spec CPU (1 : 1)
  { from: 'tbl_products', to: 'tbl_spec_cpu', isOneToMany: false, exitX: 1, exitY: 0.18, entryX: 0, entryY: 0.5 },
  // 12. Products -> Spec Motherboard (1 : 1)
  { from: 'tbl_products', to: 'tbl_spec_mobo', isOneToMany: false, exitX: 1, exitY: 0.32, entryX: 0, entryY: 0.5 },
  // 13. Products -> Spec RAM (1 : 1)
  { from: 'tbl_products', to: 'tbl_spec_ram', isOneToMany: false, exitX: 1, exitY: 0.46, entryX: 0, entryY: 0.5 },
  // 14. Products -> Spec GPU (1 : 1)
  { from: 'tbl_products', to: 'tbl_spec_gpu', isOneToMany: false, exitX: 1, exitY: 0.60, entryX: 0, entryY: 0.5 },
  // 15. Products -> Spec Storage (1 : 1)
  { from: 'tbl_products', to: 'tbl_spec_storage', isOneToMany: false, exitX: 1, exitY: 0.74, entryX: 0, entryY: 0.5 },
  // 16. Products -> Spec PSU (1 : 1)
  { from: 'tbl_products', to: 'tbl_spec_psu', isOneToMany: false, exitX: 1, exitY: 0.88, entryX: 0, entryY: 0.5 },
  // 17. Products -> Spec Case (1 : 1)
  { from: 'tbl_products', to: 'tbl_spec_case', isOneToMany: false, exitX: 0.5, exitY: 1, entryX: 0.5, entryY: 0 }
];

function generateERDiagramXml() {
  let cells = `        <mxCell id="0" />\n        <mxCell id="1" parent="0" />\n`;

  // Header Title
  cells += `        <mxCell id="header" value="Smart PC Builder - Database ER Diagram (Crow's Foot Notation with Admin Architecture)" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=18;fontStyle=1;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="100" y="15" width="880" height="40" as="geometry" />
        </mxCell>\n`;

  // Render Tables
  tables.forEach(tbl => {
    const rowHeight = 26;
    const headerHeight = 30;
    const totalHeight = headerHeight + tbl.columns.length * rowHeight;

    const tableStyle = 'shape=table;startSize=30;container=1;collapsible=0;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;strokeColor=#000000;fillColor=#ffffff;fontColor=#000000;strokeWidth=1.5;fontSize=13;';
    cells += `        <mxCell id="${tbl.id}" value="${escapeXml(tbl.name)}" style="${tableStyle}" vertex="1" parent="1">
          <mxGeometry x="${tbl.x}" y="${tbl.y}" width="${tbl.w}" height="${totalHeight}" as="geometry" />
        </mxCell>\n`;

    tbl.columns.forEach((col, idx) => {
      const rowId = `${tbl.id}_r${idx}`;
      const rowStyle = 'shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;bubblePosition=0;collapsible=0;dropTarget=0;fillColor=none;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;top=0;left=0;right=0;bottom=0;strokeColor=#e0e0e0;strokeWidth=0.5;';
      cells += `        <mxCell id="${rowId}" value="" style="${rowStyle}" vertex="1" parent="${tbl.id}">
          <mxGeometry y="${headerHeight + idx * rowHeight}" width="${tbl.w}" height="${rowHeight}" as="geometry" />
        </mxCell>\n`;

      const keyStyle = `shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;align=center;verticalAlign=middle;spacingLeft=0;overflow=hidden;fontStyle=${col.key.includes('PK') ? '1' : '0'};fontSize=11;fontColor=#000000;strokeColor=none;`;
      cells += `        <mxCell id="${rowId}_k" value="${escapeXml(col.key.trim())}" style="${keyStyle}" vertex="1" parent="${rowId}">
          <mxGeometry width="50" height="${rowHeight}" as="geometry" />
        </mxCell>\n`;

      const nameStyle = `shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;align=left;verticalAlign=middle;spacingLeft=6;overflow=hidden;fontStyle=${col.key.includes('PK') ? '1' : '0'};fontSize=11;fontColor=#000000;strokeColor=none;`;
      const colText = `${col.name} : ${col.type}`;
      cells += `        <mxCell id="${rowId}_n" value="${escapeXml(colText)}" style="${nameStyle}" vertex="1" parent="${rowId}">
          <mxGeometry x="50" width="${tbl.w - 50}" height="${rowHeight}" as="geometry" />
        </mxCell>\n`;
    });
  });

  // Render Relationships
  relationships.forEach((rel, idx) => {
    const startArrow = 'ERmandOne';
    const endArrow = rel.isOneToMany ? 'ERoneToMany' : 'ERmandOne';

    let edgeStyle = `edgeStyle=orthogonalEdgeStyle;html=1;strokeColor=#000000;strokeWidth=1.5;startArrow=${startArrow};startSize=8;endArrow=${endArrow};endSize=8;exitX=${rel.exitX};exitY=${rel.exitY};entryX=${rel.entryX};entryY=${rel.entryY};`;
    
    let arrayPointsXml = '';
    if (rel.points && rel.points.length > 0) {
      arrayPointsXml = `\n            <Array as="points">\n` + 
        rel.points.map(pt => `              <mxPoint x="${pt[0]}" y="${pt[1]}" />`).join('\n') + 
        `\n            </Array>\n          `;
    }

    cells += `        <mxCell id="rel_${idx + 1}" value="" style="${edgeStyle}" edge="1" parent="1" source="${rel.from}" target="${rel.to}">
          <mxGeometry relative="1" as="geometry">${arrayPointsXml}</mxGeometry>
        </mxCell>\n`;
  });

  return `  <diagram id="diagram_er_crowsfoot" name="ER Diagram (Crow&#39;s Foot Notation)">
    <mxGraphModel dx="1200" dy="1100" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1200" pageHeight="1100" math="0" shadow="0">
      <root>
${cells}      </root>
    </mxGraphModel>
  </diagram>`;
}

const erDiagramXml = generateERDiagramXml();

// 1. Update Master Draw.io Files
const targetMasterFiles = [
  downloadMaster1,
  downloadMaster2,
  downloadMaster,
  downloadDrawioPath,
  path.join(drawioDir, 'smart_pc_builder_er_diagram.drawio')
];

targetMasterFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    let updatedContent;
    if (originalContent.includes('<diagram id="diagram_er_crowsfoot"')) {
      updatedContent = originalContent.replace(
        /<diagram id="diagram_er_crowsfoot"[\s\S]*?<\/diagram>/,
        erDiagramXml
      );
    } else if (originalContent.includes('<diagram id="diagram_er"')) {
      updatedContent = originalContent.replace(
        /<diagram id="diagram_er"[\s\S]*?<\/diagram>/,
        erDiagramXml
      );
    } else {
      updatedContent = `<mxfile host="Electron" agent="PCSpec Master Generator" pages="14">\n${erDiagramXml}\n</mxfile>`;
    }
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`[UPDATED] ${filePath}`);
  } else {
    const standaloneXml = `<mxfile host="Electron" agent="PCSpec ER Generator">\n${erDiagramXml}\n</mxfile>`;
    fs.writeFileSync(filePath, standaloneXml, 'utf8');
    console.log(`[CREATED] ${filePath}`);
  }
});

// 2. Generate SVG File
function generateSvgER() {
  const svgWidth = 1060;
  const svgHeight = 1060;

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}" style="background-color: #ffffff; font-family: 'Inter', system-ui, sans-serif;">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#000000" />
    </marker>
  </defs>

  <!-- Header -->
  <rect x="0" y="0" width="${svgWidth}" height="55" fill="#f8f9fa" stroke="#e9ecef" stroke-width="1"/>
  <text x="30" y="35" fill="#000000" font-size="18" font-weight="700">Smart PC Builder - Database ER Diagram (MySQL)</text>
  <text x="${svgWidth - 340}" y="35" fill="#495057" font-size="12" font-weight="600">✓ Complete 15 Tables with Admin Architecture</text>

  <!-- Connection Lines -->
  <!-- users -> admins -->
  <path d="M 160 256 L 160 290" stroke="#000000" stroke-width="1.8" marker-end="url(#arrow)" />
  <rect x="140" y="263" width="40" height="18" rx="3" fill="#ffffff" stroke="#000000" stroke-width="1"/>
  <text x="147" y="276" font-size="10" font-weight="700" fill="#000000">1 : 1</text>

  <!-- users -> orders -->
  <path d="M 280 115 L 380 115" stroke="#000000" stroke-width="1.8" marker-end="url(#arrow)" />
  <rect x="315" y="105" width="36" height="18" rx="3" fill="#ffffff" stroke="#000000" stroke-width="1"/>
  <text x="320" y="118" font-size="10" font-weight="700" fill="#000000">1 : N</text>

  <!-- admins -> orders -->
  <path d="M 280 340 L 330 340 L 330 170 L 380 170" fill="none" stroke="#000000" stroke-width="1.8" marker-end="url(#arrow)" />
  <rect x="312" y="245" width="36" height="18" rx="3" fill="#ffffff" stroke="#000000" stroke-width="1"/>
  <text x="317" y="258" font-size="10" font-weight="700" fill="#000000">1 : N</text>

  <!-- admins -> categories -->
  <path d="M 280 445 L 380 445" stroke="#000000" stroke-width="1.8" marker-end="url(#arrow)" />
  <rect x="315" y="435" width="36" height="18" rx="3" fill="#ffffff" stroke="#000000" stroke-width="1"/>
  <text x="320" y="448" font-size="10" font-weight="700" fill="#000000">1 : N</text>

  <!-- admins -> products -->
  <path d="M 280 465 L 330 465 L 330 670 L 380 670" fill="none" stroke="#000000" stroke-width="1.8" marker-end="url(#arrow)" />
  <rect x="312" y="555" width="36" height="18" rx="3" fill="#ffffff" stroke="#000000" stroke-width="1"/>
  <text x="317" y="568" font-size="10" font-weight="700" fill="#000000">1 : N</text>

  <!-- admins -> admin_logs -->
  <path d="M 160 476 L 160 510" stroke="#000000" stroke-width="1.8" marker-end="url(#arrow)" />
  <rect x="140" y="483" width="40" height="18" rx="3" fill="#ffffff" stroke="#000000" stroke-width="1"/>
  <text x="147" y="496" font-size="10" font-weight="700" fill="#000000">1 : N</text>

  <!-- admins -> articles -->
  <path d="M 40 420 L 15 420 L 15 815 L 40 815" fill="none" stroke="#000000" stroke-width="1.8" marker-end="url(#arrow)" />
  <rect x="0" y="610" width="30" height="18" rx="3" fill="#ffffff" stroke="#000000" stroke-width="1"/>
  <text x="3" y="623" font-size="9" font-weight="700" fill="#000000">1:N</text>

  <!-- orders -> order_items -->
  <path d="M 650 115 L 750 115" stroke="#000000" stroke-width="1.8" marker-end="url(#arrow)" />
  <rect x="685" y="105" width="36" height="18" rx="3" fill="#ffffff" stroke="#000000" stroke-width="1"/>
  <text x="690" y="118" font-size="10" font-weight="700" fill="#000000">1 : N</text>

  <!-- categories -> products -->
  <path d="M 515 576 L 515 610" stroke="#000000" stroke-width="1.8" marker-end="url(#arrow)" />
  <rect x="495" y="583" width="40" height="18" rx="3" fill="#ffffff" stroke="#000000" stroke-width="1"/>
  <text x="502" y="596" font-size="10" font-weight="700" fill="#000000">1 : N</text>

  <!-- products -> order_items -->
  <path d="M 650 635 L 700 635 L 700 180 L 750 180" fill="none" stroke="#000000" stroke-width="1.8" marker-end="url(#arrow)" />

  <!-- products -> spec_cpu -->
  <path d="M 650 660 L 700 660 L 700 320 L 750 320" fill="none" stroke="#000000" stroke-width="1.8" marker-end="url(#arrow)" />

  <!-- products -> spec_motherboard -->
  <path d="M 650 700 L 700 700 L 700 445 L 750 445" fill="none" stroke="#000000" stroke-width="1.8" marker-end="url(#arrow)" />

  <!-- products -> spec_ram -->
  <path d="M 650 740 L 700 740 L 700 570 L 750 570" fill="none" stroke="#000000" stroke-width="1.8" marker-end="url(#arrow)" />

  <!-- products -> spec_gpu -->
  <path d="M 650 780 L 700 780 L 700 690 L 750 690" fill="none" stroke="#000000" stroke-width="1.8" marker-end="url(#arrow)" />

  <!-- products -> spec_storage -->
  <path d="M 650 820 L 700 820 L 700 795 L 750 795" fill="none" stroke="#000000" stroke-width="1.8" marker-end="url(#arrow)" />

  <!-- products -> spec_psu -->
  <path d="M 650 860 L 700 860 L 700 910 L 750 910" fill="none" stroke="#000000" stroke-width="1.8" marker-end="url(#arrow)" />

  <!-- products -> spec_case -->
  <path d="M 515 896 L 515 930" stroke="#000000" stroke-width="1.8" marker-end="url(#arrow)" />
`;

  // Draw Entity Tables in SVG
  tables.forEach(tbl => {
    const headerHeight = 28;
    const rowHeight = 22;
    const totalHeight = headerHeight + tbl.columns.length * rowHeight + 8;

    svgContent += `  <!-- Table: ${tbl.name} -->
  <g>
    <rect x="${tbl.x}" y="${tbl.y}" width="${tbl.w}" height="${totalHeight}" rx="6" fill="#ffffff" stroke="#000000" stroke-width="2"/>
    <rect x="${tbl.x}" y="${tbl.y}" width="${tbl.w}" height="${headerHeight}" rx="6" fill="#f1f3f5" stroke="#000000" stroke-width="2"/>
    <text x="${tbl.x + tbl.w / 2}" y="${tbl.y + 19}" font-size="12" font-weight="700" fill="#000000" text-anchor="middle">${tbl.name.toUpperCase()}</text>\n`;

    tbl.columns.forEach((col, idx) => {
      const colY = tbl.y + 44 + idx * rowHeight;
      const keyTag = col.key.trim() ? `[${col.key.trim()}] ` : '';
      const fontWeight = col.key.trim() ? '700' : '400';
      svgContent += `    <text x="${tbl.x + 8}" y="${colY}" font-size="11" font-weight="${fontWeight}" fill="#000000">${keyTag}${col.name}</text>
    <text x="${tbl.x + tbl.w - 8}" y="${colY}" font-size="11" font-weight="400" fill="#495057" text-anchor="end">${col.type}</text>\n`;
    });

    svgContent += `  </g>\n`;
  });

  svgContent += `</svg>`;

  const svgPath = path.join(svgDir, 'er_diagram.svg');
  fs.writeFileSync(svgPath, svgContent, 'utf8');
  console.log(`[CREATED] ${svgPath}`);
}

generateSvgER();
console.log('All ER diagram files with Full Admin Architecture generated successfully!');
