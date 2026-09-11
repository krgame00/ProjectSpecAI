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

const tables = [
  // 1. Users (ลูกค้าและแอดมิน)
  {
    id: 'tbl_users',
    name: 'users',
    x: 50, y: 80, w: 250,
    columns: [
      { key: 'PK', name: 'id', type: 'INT' },
      { key: ' ', name: 'name', type: 'VARCHAR(100)' },
      { key: 'UQ', name: 'email', type: 'VARCHAR(100)' },
      { key: ' ', name: 'password', type: 'VARCHAR(255)' },
      { key: ' ', name: 'role', type: 'VARCHAR(20)' },
      { key: ' ', name: 'created_at', type: 'TIMESTAMP' }
    ]
  },
  // 2. Admin Logs (ประวัติการทำงานของแอดมิน) - NEW ADMIN TABLE
  {
    id: 'tbl_admin_logs',
    name: 'admin_logs',
    x: 50, y: 310, w: 250,
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
  // 3. Articles (บทความและข่าวสารไอที จัดการโดย Admin)
  {
    id: 'tbl_articles',
    name: 'articles',
    x: 50, y: 560, w: 250,
    columns: [
      { key: 'PK', name: 'id', type: 'INT' },
      { key: 'FK', name: 'admin_id', type: 'INT' },
      { key: ' ', name: 'title', type: 'VARCHAR(255)' },
      { key: ' ', name: 'content', type: 'TEXT' },
      { key: ' ', name: 'image_url', type: 'VARCHAR(255)' },
      { key: ' ', name: 'created_at', type: 'TIMESTAMP' }
    ]
  },
  // 4. Spec PSU
  {
    id: 'tbl_spec_psu',
    name: 'spec_psu',
    x: 50, y: 790, w: 250,
    columns: [
      { key: 'PK,FK', name: 'product_id', type: 'INT' },
      { key: ' ', name: 'wattage', type: 'INT' }
    ]
  },
  // 5. Orders (คำสั่งซื้อของลูกค้า)
  {
    id: 'tbl_orders',
    name: 'orders',
    x: 390, y: 80, w: 270,
    columns: [
      { key: 'PK', name: 'id', type: 'VARCHAR(50)' },
      { key: 'FK', name: 'user_id', type: 'INT' },
      { key: ' ', name: 'customer_name', type: 'VARCHAR(100)' },
      { key: ' ', name: 'customer_address', type: 'TEXT' },
      { key: ' ', name: 'customer_phone', type: 'VARCHAR(20)' },
      { key: ' ', name: 'assembly_type', type: 'VARCHAR(50)' },
      { key: ' ', name: 'total_price', type: 'DECIMAL(10,2)' },
      { key: ' ', name: 'status', type: 'VARCHAR(50)' },
      { key: ' ', name: 'created_at', type: 'TIMESTAMP' }
    ]
  },
  // 6. Categories (หมวดหมู่อุปกรณ์)
  {
    id: 'tbl_categories',
    name: 'categories',
    x: 390, y: 380, w: 270,
    columns: [
      { key: 'PK', name: 'id', type: 'INT' },
      { key: 'UQ', name: 'slug', type: 'VARCHAR(50)' },
      { key: ' ', name: 'name_th', type: 'VARCHAR(100)' },
      { key: ' ', name: 'description', type: 'TEXT' },
      { key: ' ', name: 'created_at', type: 'TIMESTAMP' }
    ]
  },
  // 7. Products (ข้อมูลอุปกรณ์คอมพิวเตอร์)
  {
    id: 'tbl_products',
    name: 'products',
    x: 390, y: 570, w: 270,
    columns: [
      { key: 'PK', name: 'id', type: 'INT' },
      { key: 'FK', name: 'category_id', type: 'INT' },
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
    x: 390, y: 870, w: 270,
    columns: [
      { key: 'PK,FK', name: 'product_id', type: 'INT' },
      { key: ' ', name: 'form_factor_support', type: 'VARCHAR(255)' }
    ]
  },
  // 9. Order Items (รายการสินค้าในคำสั่งซื้อ)
  {
    id: 'tbl_order_items',
    name: 'order_items',
    x: 750, y: 80, w: 250,
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
    x: 750, y: 280, w: 250,
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
    x: 750, y: 410, w: 250,
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
    x: 750, y: 540, w: 250,
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
    x: 750, y: 670, w: 250,
    columns: [
      { key: 'PK,FK', name: 'product_id', type: 'INT' },
      { key: ' ', name: 'tdp_watt', type: 'INT' }
    ]
  },
  // 14. Spec Storage
  {
    id: 'tbl_spec_storage',
    name: 'spec_storage',
    x: 750, y: 770, w: 250,
    columns: [
      { key: 'PK,FK', name: 'product_id', type: 'INT' },
      { key: ' ', name: 'type', type: 'VARCHAR(50)' },
      { key: ' ', name: 'capacity_gb', type: 'INT' }
    ]
  }
];

const relationships = [
  // 1. Users -> Orders (1 : N)
  { from: 'tbl_users', to: 'tbl_orders', isOneToMany: true, exitX: 1, exitY: 0.2, entryX: 0, entryY: 0.15 },
  // 2. Orders -> Order Items (1 : N)
  { from: 'tbl_orders', to: 'tbl_order_items', isOneToMany: true, exitX: 1, exitY: 0.15, entryX: 0, entryY: 0.25 },
  // 3. Categories -> Products (1 : N)
  { from: 'tbl_categories', to: 'tbl_products', isOneToMany: true, exitX: 0.5, exitY: 1, entryX: 0.5, entryY: 0 },
  // 4. Products -> Order Items (1 : N)
  { from: 'tbl_products', to: 'tbl_order_items', isOneToMany: true, exitX: 1, exitY: 0.1, entryX: 0, entryY: 0.7 },
  // 5. Users (Admin) -> Admin Logs (1 : N)
  { from: 'tbl_users', to: 'tbl_admin_logs', isOneToMany: true, exitX: 0.5, exitY: 1, entryX: 0.5, entryY: 0 },
  // 6. Users (Admin) -> Articles (1 : N)
  { from: 'tbl_users', to: 'tbl_articles', isOneToMany: true, exitX: 0, exitY: 0.5, entryX: 0, entryY: 0.3, points: [[20, 173], [20, 615]] },
  // 7. Products -> Spec CPU (1 : 1)
  { from: 'tbl_products', to: 'tbl_spec_cpu', isOneToMany: false, exitX: 1, exitY: 0.2, entryX: 0, entryY: 0.5 },
  // 8. Products -> Spec Motherboard (1 : 1)
  { from: 'tbl_products', to: 'tbl_spec_mobo', isOneToMany: false, exitX: 1, exitY: 0.35, entryX: 0, entryY: 0.5 },
  // 9. Products -> Spec RAM (1 : 1)
  { from: 'tbl_products', to: 'tbl_spec_ram', isOneToMany: false, exitX: 1, exitY: 0.5, entryX: 0, entryY: 0.5 },
  // 10. Products -> Spec GPU (1 : 1)
  { from: 'tbl_products', to: 'tbl_spec_gpu', isOneToMany: false, exitX: 1, exitY: 0.65, entryX: 0, entryY: 0.5 },
  // 11. Products -> Spec Storage (1 : 1)
  { from: 'tbl_products', to: 'tbl_spec_storage', isOneToMany: false, exitX: 1, exitY: 0.8, entryX: 0, entryY: 0.5 },
  // 12. Products -> Spec PSU (1 : 1)
  { from: 'tbl_products', to: 'tbl_spec_psu', isOneToMany: false, exitX: 0, exitY: 0.85, entryX: 1, entryY: 0.5 },
  // 13. Products -> Spec Case (1 : 1)
  { from: 'tbl_products', to: 'tbl_spec_case', isOneToMany: false, exitX: 0.5, exitY: 1, entryX: 0.5, entryY: 0 }
];

function generateERDiagramXml() {
  let cells = `        <mxCell id="0" />\n        <mxCell id="1" parent="0" />\n`;

  // Header Title
  cells += `        <mxCell id="header" value="Smart PC Builder - Database ER Diagram (Crow's Foot Notation with Admin Model)" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=18;fontStyle=1;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="100" y="20" width="880" height="40" as="geometry" />
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
          <mxGeometry width="45" height="${rowHeight}" as="geometry" />
        </mxCell>\n`;

      const nameStyle = `shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;align=left;verticalAlign=middle;spacingLeft=6;overflow=hidden;fontStyle=${col.key.includes('PK') ? '1' : '0'};fontSize=11;fontColor=#000000;strokeColor=none;`;
      const colText = `${col.name} : ${col.type}`;
      cells += `        <mxCell id="${rowId}_n" value="${escapeXml(colText)}" style="${nameStyle}" vertex="1" parent="${rowId}">
          <mxGeometry x="45" width="${tbl.w - 45}" height="${rowHeight}" as="geometry" />
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
    <mxGraphModel dx="1200" dy="1050" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1200" pageHeight="1050" math="0" shadow="0">
      <root>
${cells}      </root>
    </mxGraphModel>
  </diagram>`;
}

// Generate new ER Diagram XML tag
const newERDiagramXml = generateERDiagramXml();

// Target files to update
const targetFiles = [
  'C:/Users/PC/Downloads/pcspec_all_system_diagrams_master (1).drawio',
  'C:/Users/PC/Downloads/pcspec_all_system_diagrams_master (2).drawio',
  'C:/Users/PC/Downloads/pcspec_all_system_diagrams_master.drawio',
  'C:/Users/PC/Downloads/smart_pc_builder_er_diagram.drawio'
];

targetFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    
    let updatedContent;
    if (originalContent.includes('<diagram id="diagram_er_crowsfoot"')) {
      // Replace existing diagram_er_crowsfoot
      updatedContent = originalContent.replace(
        /<diagram id="diagram_er_crowsfoot"[\s\S]*?<\/diagram>/,
        newERDiagramXml
      );
    } else if (originalContent.includes('<diagram id="diagram_er"')) {
      // Replace existing diagram_er
      updatedContent = originalContent.replace(
        /<diagram id="diagram_er"[\s\S]*?<\/diagram>/,
        newERDiagramXml
      );
    } else {
      // Single diagram file or master file
      updatedContent = `<mxfile host="Electron" agent="PCSpec Master Generator" pages="14">\n${newERDiagramXml}\n</mxfile>`;
    }
    
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`[SUCCESS] Updated ER diagram with Admin model in: ${filePath}`);
  }
});
