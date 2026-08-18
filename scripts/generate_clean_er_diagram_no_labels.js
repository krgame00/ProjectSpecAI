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
  {
    id: 'tbl_users',
    name: 'users',
    x: 60, y: 100, w: 240,
    columns: [
      { key: 'PK', name: 'id', type: 'INT' },
      { key: ' ', name: 'name', type: 'VARCHAR(100)' },
      { key: 'UQ', name: 'email', type: 'VARCHAR(100)' },
      { key: ' ', name: 'password', type: 'VARCHAR(255)' },
      { key: ' ', name: 'role', type: 'VARCHAR(20)' },
      { key: ' ', name: 'created_at', type: 'TIMESTAMP' }
    ]
  },
  {
    id: 'tbl_orders',
    name: 'orders',
    x: 420, y: 100, w: 260,
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
  {
    id: 'tbl_order_items',
    name: 'order_items',
    x: 800, y: 100, w: 240,
    columns: [
      { key: 'PK', name: 'id', type: 'INT' },
      { key: 'FK', name: 'order_id', type: 'VARCHAR(50)' },
      { key: 'FK', name: 'product_id', type: 'INT' },
      { key: ' ', name: 'category_slug', type: 'VARCHAR(50)' },
      { key: ' ', name: 'price', type: 'DECIMAL(10,2)' }
    ]
  },
  {
    id: 'tbl_categories',
    name: 'categories',
    x: 60, y: 380, w: 240,
    columns: [
      { key: 'PK', name: 'id', type: 'INT' },
      { key: 'UQ', name: 'slug', type: 'VARCHAR(50)' },
      { key: ' ', name: 'name_th', type: 'VARCHAR(100)' },
      { key: ' ', name: 'description', type: 'TEXT' },
      { key: ' ', name: 'created_at', type: 'TIMESTAMP' }
    ]
  },
  {
    id: 'tbl_products',
    name: 'products',
    x: 420, y: 380, w: 260,
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
  {
    id: 'tbl_articles',
    name: 'articles',
    x: 60, y: 580, w: 240,
    columns: [
      { key: 'PK', name: 'id', type: 'INT' },
      { key: ' ', name: 'title', type: 'VARCHAR(255)' },
      { key: ' ', name: 'content', type: 'TEXT' },
      { key: ' ', name: 'image_url', type: 'VARCHAR(255)' },
      { key: ' ', name: 'created_at', type: 'TIMESTAMP' }
    ]
  },
  {
    id: 'tbl_spec_cpu',
    name: 'spec_cpu',
    x: 800, y: 280, w: 240,
    columns: [
      { key: 'PK,FK', name: 'product_id', type: 'INT' },
      { key: ' ', name: 'socket', type: 'VARCHAR(50)' },
      { key: ' ', name: 'tdp_watt', type: 'INT' }
    ]
  },
  {
    id: 'tbl_spec_mobo',
    name: 'spec_motherboard',
    x: 800, y: 400, w: 240,
    columns: [
      { key: 'PK,FK', name: 'product_id', type: 'INT' },
      { key: ' ', name: 'socket', type: 'VARCHAR(50)' },
      { key: ' ', name: 'ram_type', type: 'VARCHAR(20)' }
    ]
  },
  {
    id: 'tbl_spec_ram',
    name: 'spec_ram',
    x: 800, y: 520, w: 240,
    columns: [
      { key: 'PK,FK', name: 'product_id', type: 'INT' },
      { key: ' ', name: 'ram_type', type: 'VARCHAR(20)' },
      { key: ' ', name: 'capacity_gb', type: 'INT' }
    ]
  },
  {
    id: 'tbl_spec_gpu',
    name: 'spec_gpu',
    x: 800, y: 640, w: 240,
    columns: [
      { key: 'PK,FK', name: 'product_id', type: 'INT' },
      { key: ' ', name: 'tdp_watt', type: 'INT' }
    ]
  },
  {
    id: 'tbl_spec_storage',
    name: 'spec_storage',
    x: 800, y: 740, w: 240,
    columns: [
      { key: 'PK,FK', name: 'product_id', type: 'INT' },
      { key: ' ', name: 'type', type: 'VARCHAR(50)' },
      { key: ' ', name: 'capacity_gb', type: 'INT' }
    ]
  },
  {
    id: 'tbl_spec_psu',
    name: 'spec_psu',
    x: 60, y: 760, w: 240,
    columns: [
      { key: 'PK,FK', name: 'product_id', type: 'INT' },
      { key: ' ', name: 'wattage', type: 'INT' }
    ]
  },
  {
    id: 'tbl_spec_case',
    name: 'spec_case',
    x: 420, y: 690, w: 260,
    columns: [
      { key: 'PK,FK', name: 'product_id', type: 'INT' },
      { key: ' ', name: 'form_factor_support', type: 'VARCHAR(255)' }
    ]
  }
];

// Relationships using Draw.io Entity Relation notation without text labels
const relationships = [
  { from: 'tbl_users', to: 'tbl_orders', isOneToMany: true, exitX: 1, exitY: 0.3, entryX: 0, entryY: 0.3 },
  { from: 'tbl_orders', to: 'tbl_order_items', isOneToMany: true, exitX: 1, exitY: 0.3, entryX: 0, entryY: 0.3 },
  { from: 'tbl_categories', to: 'tbl_products', isOneToMany: true, exitX: 1, exitY: 0.3, entryX: 0, entryY: 0.3 },
  { from: 'tbl_products', to: 'tbl_order_items', isOneToMany: true, exitX: 1, exitY: 0.15, entryX: 0, entryY: 0.8 },
  { from: 'tbl_products', to: 'tbl_spec_cpu', isOneToMany: false, exitX: 1, exitY: 0.25, entryX: 0, entryY: 0.5 },
  { from: 'tbl_products', to: 'tbl_spec_mobo', isOneToMany: false, exitX: 1, exitY: 0.45, entryX: 0, entryY: 0.5 },
  { from: 'tbl_products', to: 'tbl_spec_ram', isOneToMany: false, exitX: 1, exitY: 0.65, entryX: 0, entryY: 0.5 },
  { from: 'tbl_products', to: 'tbl_spec_gpu', isOneToMany: false, exitX: 1, exitY: 0.85, entryX: 0, entryY: 0.5 },
  { from: 'tbl_products', to: 'tbl_spec_storage', isOneToMany: false, exitX: 1, exitY: 0.95, entryX: 0, entryY: 0.5 },
  { from: 'tbl_products', to: 'tbl_spec_psu', isOneToMany: false, exitX: 0, exitY: 0.85, entryX: 1, entryY: 0.5 },
  { from: 'tbl_products', to: 'tbl_spec_case', isOneToMany: false, exitX: 0.5, exitY: 1, entryX: 0.5, entryY: 0 }
];

function generateCleanERDrawioXML() {
  let cells = `        <mxCell id="0" />\n        <mxCell id="1" parent="0" />\n`;

  // Header Title
  cells += `        <mxCell id="header" value="Smart PC Builder - Database ER Diagram (Crow's Foot Notation)" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=18;fontStyle=1;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="120" y="20" width="860" height="40" as="geometry" />
        </mxCell>\n`;

  // Render Table Entities using Draw.io Entity Relation table standard
  tables.forEach(tbl => {
    const rowHeight = 26;
    const headerHeight = 30;
    const totalHeight = headerHeight + tbl.columns.length * rowHeight;

    // Entity Table Container
    const tableStyle = 'shape=table;startSize=30;container=1;collapsible=0;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;strokeColor=#000000;fillColor=#ffffff;fontColor=#000000;strokeWidth=1.5;fontSize=13;';
    cells += `        <mxCell id="${tbl.id}" value="${escapeXml(tbl.name)}" style="${tableStyle}" vertex="1" parent="1">
          <mxGeometry x="${tbl.x}" y="${tbl.y}" width="${tbl.w}" height="${totalHeight}" as="geometry" />
        </mxCell>\n`;

    // Render Each Column Row
    tbl.columns.forEach((col, idx) => {
      const rowId = `${tbl.id}_r${idx}`;
      const rowStyle = 'shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;bubblePosition=0;collapsible=0;dropTarget=0;fillColor=none;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;top=0;left=0;right=0;bottom=0;strokeColor=#e0e0e0;strokeWidth=0.5;';
      cells += `        <mxCell id="${rowId}" value="" style="${rowStyle}" vertex="1" parent="${tbl.id}">
          <mxGeometry y="${headerHeight + idx * rowHeight}" width="${tbl.w}" height="${rowHeight}" as="geometry" />
        </mxCell>\n`;

      // Cell 1: Key (PK / FK / UQ)
      const keyStyle = `shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;align=center;verticalAlign=middle;spacingLeft=0;overflow=hidden;fontStyle=${col.key.includes('PK') ? '1' : '0'};fontSize=11;fontColor=#000000;strokeColor=none;`;
      cells += `        <mxCell id="${rowId}_k" value="${escapeXml(col.key.trim())}" style="${keyStyle}" vertex="1" parent="${rowId}">
          <mxGeometry width="45" height="${rowHeight}" as="geometry" />
        </mxCell>\n`;

      // Cell 2: Column Name & Type
      const nameStyle = `shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;align=left;verticalAlign=middle;spacingLeft=6;overflow=hidden;fontStyle=${col.key.includes('PK') ? '1' : '0'};fontSize=11;fontColor=#000000;strokeColor=none;`;
      const colText = `${col.name} : ${col.type}`;
      cells += `        <mxCell id="${rowId}_n" value="${escapeXml(colText)}" style="${nameStyle}" vertex="1" parent="${rowId}">
          <mxGeometry x="45" width="${tbl.w - 45}" height="${rowHeight}" as="geometry" />
        </mxCell>\n`;
    });
  });

  // Render ER Crow's Foot Connector Lines without text labels
  relationships.forEach((rel, idx) => {
    const startArrow = 'ERmandOne';
    const endArrow = rel.isOneToMany ? 'ERoneToMany' : 'ERmandOne';

    const edgeStyle = `edgeStyle=orthogonalEdgeStyle;html=1;strokeColor=#000000;strokeWidth=1.5;startArrow=${startArrow};startSize=8;endArrow=${endArrow};endSize=8;exitX=${rel.exitX};exitY=${rel.exitY};entryX=${rel.entryX};entryY=${rel.entryY};`;
    
    cells += `        <mxCell id="rel_${idx + 1}" value="" style="${edgeStyle}" edge="1" parent="1" source="${rel.from}" target="${rel.to}">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>\n`;
  });

  return `<mxfile host="Electron" modified="${new Date().toISOString()}" agent="PCSpec Native ER Generator" version="21.0.0" type="device">
  <diagram id="diagram_er_crowsfoot" name="ER Diagram (Crow\'s Foot Notation)">
    <mxGraphModel dx="1400" dy="1400" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="1654" math="0" shadow="0">
      <root>
${cells}      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
}

const erXml = generateCleanERDrawioXML();
const targetPath = 'C:/Users/PC/Downloads/smart_pc_builder_er_diagram.drawio';
fs.writeFileSync(targetPath, erXml, 'utf8');
console.log('Successfully wrote Clean Native Draw.io ER Diagram (No text labels) to:', targetPath);
