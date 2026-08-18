const fs = require('fs');
const path = require('path');

const targetDownloadPath = 'C:/Users/PC/Downloads/smart_pc_builder_er_diagram.drawio';
const backupDownloadPath = 'C:/Users/PC/Downloads/smart_pc_builder_er_diagram_backup.drawio';

const docsDrawioPath = path.join(__dirname, '..', 'docs', 'drawio', 'smart_pc_builder_er_diagram.drawio');
const docsSvgPath = path.join(__dirname, '..', 'docs', 'er_diagram.svg');

// Backup original
if (fs.existsSync(targetDownloadPath)) {
  fs.copyFileSync(targetDownloadPath, backupDownloadPath);
  console.log('Created backup at:', backupDownloadPath);
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

const tables = [
  // 1. Users
  {
    id: 'table_users',
    name: 'users',
    x: 60, y: 80, w: 230, h: 165,
    columns: [
      { name: 'id', type: 'INT', key: 'PK' },
      { name: 'name', type: 'VARCHAR(100)' },
      { name: 'email', type: 'VARCHAR(100)', key: 'UQ' },
      { name: 'password', type: 'VARCHAR(255)' },
      { name: 'role', type: 'VARCHAR(20)' },
      { name: 'created_at', type: 'TIMESTAMP' }
    ]
  },
  // 2. Orders
  {
    id: 'table_orders',
    name: 'orders',
    x: 370, y: 80, w: 250, h: 230,
    columns: [
      { name: 'id', type: 'VARCHAR(50)', key: 'PK' },
      { name: 'user_id', type: 'INT', key: 'FK' },
      { name: 'customer_name', type: 'VARCHAR(100)' },
      { name: 'customer_address', type: 'TEXT' },
      { name: 'customer_phone', type: 'VARCHAR(20)' },
      { name: 'assembly_type', type: 'VARCHAR(50)' },
      { name: 'total_price', type: 'DECIMAL(10,2)' },
      { name: 'status', type: 'VARCHAR(50)' },
      { name: 'created_at', type: 'TIMESTAMP' }
    ]
  },
  // 3. Order Items
  {
    id: 'table_order_items',
    name: 'order_items',
    x: 710, y: 80, w: 230, h: 145,
    columns: [
      { name: 'id', type: 'INT', key: 'PK' },
      { name: 'order_id', type: 'VARCHAR(50)', key: 'FK' },
      { name: 'product_id', type: 'INT', key: 'FK' },
      { name: 'category_slug', type: 'VARCHAR(50)' },
      { name: 'price', type: 'DECIMAL(10,2)' }
    ]
  },
  // 4. Categories
  {
    id: 'table_categories',
    name: 'categories',
    x: 60, y: 350, w: 230, h: 145,
    columns: [
      { name: 'id', type: 'INT', key: 'PK' },
      { name: 'slug', type: 'VARCHAR(50)', key: 'UQ' },
      { name: 'name_th', type: 'VARCHAR(100)' },
      { name: 'description', type: 'TEXT' },
      { name: 'created_at', type: 'TIMESTAMP' }
    ]
  },
  // 5. Products (Master)
  {
    id: 'table_products',
    name: 'products',
    x: 370, y: 350, w: 250, h: 230,
    columns: [
      { name: 'id', type: 'INT', key: 'PK' },
      { name: 'category_id', type: 'INT', key: 'FK' },
      { name: 'brand', type: 'VARCHAR(100)' },
      { name: 'model', type: 'VARCHAR(255)' },
      { name: 'price', type: 'DECIMAL(10,2)' },
      { name: 'image_url', type: 'VARCHAR(255)' },
      { name: 'stock_quantity', type: 'INT' },
      { name: 'specifications', type: 'JSON' },
      { name: 'created_at', type: 'TIMESTAMP' }
    ]
  },
  // 6. Articles (New)
  {
    id: 'table_articles',
    name: 'articles',
    x: 60, y: 530, w: 230, h: 145,
    columns: [
      { name: 'id', type: 'INT', key: 'PK' },
      { name: 'title', type: 'VARCHAR(255)' },
      { name: 'content', type: 'TEXT' },
      { name: 'image_url', type: 'VARCHAR(255)' },
      { name: 'created_at', type: 'TIMESTAMP' }
    ]
  },
  // 7. Spec CPU
  {
    id: 'table_spec_cpu',
    name: 'spec_cpu',
    x: 710, y: 260, w: 230, h: 95,
    columns: [
      { name: 'product_id', type: 'INT', key: 'PK/FK' },
      { name: 'socket', type: 'VARCHAR(50)' },
      { name: 'tdp_watt', type: 'INT' }
    ]
  },
  // 8. Spec Motherboard
  {
    id: 'table_spec_mobo',
    name: 'spec_motherboard',
    x: 710, y: 380, w: 230, h: 95,
    columns: [
      { name: 'product_id', type: 'INT', key: 'PK/FK' },
      { name: 'socket', type: 'VARCHAR(50)' },
      { name: 'ram_type', type: 'VARCHAR(20)' }
    ]
  },
  // 9. Spec RAM
  {
    id: 'table_spec_ram',
    name: 'spec_ram',
    x: 710, y: 500, w: 230, h: 95,
    columns: [
      { name: 'product_id', type: 'INT', key: 'PK/FK' },
      { name: 'ram_type', type: 'VARCHAR(20)' },
      { name: 'capacity_gb', type: 'INT' }
    ]
  },
  // 10. Spec GPU
  {
    id: 'table_spec_gpu',
    name: 'spec_gpu',
    x: 710, y: 620, w: 230, h: 75,
    columns: [
      { name: 'product_id', type: 'INT', key: 'PK/FK' },
      { name: 'tdp_watt', type: 'INT' }
    ]
  },
  // 11. Spec Storage (New)
  {
    id: 'table_spec_storage',
    name: 'spec_storage',
    x: 710, y: 720, w: 230, h: 95,
    columns: [
      { name: 'product_id', type: 'INT', key: 'PK/FK' },
      { name: 'type', type: 'VARCHAR(50)' },
      { name: 'capacity_gb', type: 'INT' }
    ]
  },
  // 12. Spec PSU
  {
    id: 'table_spec_psu',
    name: 'spec_psu',
    x: 60, y: 710, w: 230, h: 75,
    columns: [
      { name: 'product_id', type: 'INT', key: 'PK/FK' },
      { name: 'wattage', type: 'INT' }
    ]
  },
  // 13. Spec Case
  {
    id: 'table_spec_case',
    name: 'spec_case',
    x: 370, y: 630, w: 250, h: 75,
    columns: [
      { name: 'product_id', type: 'INT', key: 'PK/FK' },
      { name: 'form_factor_support', type: 'VARCHAR(255)' }
    ]
  }
];

const relationships = [
  { from: 'table_users', to: 'table_orders', label: '1 : N', style: 'exitX=1;exitY=0.5;entryX=0;entryY=0.5;' },
  { from: 'table_orders', to: 'table_order_items', label: '1 : N', style: 'exitX=1;exitY=0.5;entryX=0;entryY=0.5;' },
  { from: 'table_products', to: 'table_order_items', label: '1 : N', style: 'exitX=1;exitY=0.15;entryX=0;entryY=0.8;' },
  { from: 'table_categories', to: 'table_products', label: '1 : N', style: 'exitX=1;exitY=0.5;entryX=0;entryY=0.5;' },
  { from: 'table_products', to: 'table_spec_cpu', label: '1 : 1', style: 'exitX=1;exitY=0.25;entryX=0;entryY=0.5;' },
  { from: 'table_products', to: 'table_spec_mobo', label: '1 : 1', style: 'exitX=1;exitY=0.45;entryX=0;entryY=0.5;' },
  { from: 'table_products', to: 'table_spec_ram', label: '1 : 1', style: 'exitX=1;exitY=0.65;entryX=0;entryY=0.5;' },
  { from: 'table_products', to: 'table_spec_gpu', label: '1 : 1', style: 'exitX=1;exitY=0.85;entryX=0;entryY=0.5;' },
  { from: 'table_products', to: 'table_spec_storage', label: '1 : 1', style: 'exitX=1;exitY=0.95;entryX=0;entryY=0.5;' },
  { from: 'table_products', to: 'table_spec_psu', label: '1 : 1', style: 'exitX=0;exitY=0.85;entryX=1;entryY=0.5;' },
  { from: 'table_products', to: 'table_spec_case', label: '1 : 1', style: 'exitX=0.5;exitY=1;entryX=0.5;entryY=0;' }
];

function generateDrawioXml() {
  let cellsXml = `        <mxCell id="0" />\n        <mxCell id="1" parent="0" />\n`;

  // Header Title
  cellsXml += `        <mxCell id="header" value="Smart PC Builder - Database ER Diagram (MySQL)" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=20;fontStyle=1;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="120" y="20" width="760" height="40" as="geometry" />
        </mxCell>\n`;

  // Render ER Table Boxes
  tables.forEach(tbl => {
    const style = 'shape=swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;strokeWidth=1.5;fontSize=13;';

    cellsXml += `        <mxCell id="${tbl.id}" value="${escapeXml(tbl.name)}" style="${style}" vertex="1" parent="1">
          <mxGeometry x="${tbl.x}" y="${tbl.y}" width="${tbl.w}" height="${tbl.h}" as="geometry" />
        </mxCell>\n`;

    tbl.columns.forEach((c, idx) => {
      const k = c.key ? `[${c.key}] ` : '';
      const rowTxt = `${k}${c.name} : ${c.type}`;
      const rowStyle = 'text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=6;fontSize=11;fontColor=#000000;';
      cellsXml += `        <mxCell id="${tbl.id}_c${idx}" value="${escapeXml(rowTxt)}" style="${rowStyle}" vertex="1" parent="${tbl.id}">
          <mxGeometry y="${26 + idx * 22}" width="${tbl.w}" height="22" as="geometry" />
        </mxCell>\n`;
    });
  });

  // Render Relationship Connections
  relationships.forEach((rel, idx) => {
    const style = `edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#000000;strokeWidth=1.5;fontColor=#000000;fontSize=11;fontStyle=1;labelBackgroundColor=#ffffff;labelBorderColor=#000000;${rel.style}`;
    cellsXml += `        <mxCell id="rel_${idx + 1}" value="${escapeXml(rel.label)}" style="${style}" edge="1" parent="1" source="${rel.from}" target="${rel.to}">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>\n`;
  });

  return `<mxfile host="Electron" modified="${new Date().toISOString()}" agent="PCSpec ER Generator" version="21.0.0" type="device">
  <diagram id="diagram_er" name="ER Diagram (smart_pc_builder)">
    <mxGraphModel dx="1400" dy="1200" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="1654" math="0" shadow="0">
      <root>
${cellsXml}      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
}

const xmlOutput = generateDrawioXml();

// Write to Downloads
fs.writeFileSync(targetDownloadPath, xmlOutput, 'utf8');
console.log('Updated Download file:', targetDownloadPath);

// Write to docs folder
fs.writeFileSync(docsDrawioPath, xmlOutput, 'utf8');
console.log('Updated Docs Draw.io file:', docsDrawioPath);
