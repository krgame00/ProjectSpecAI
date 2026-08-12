const fs = require('fs');
const path = require('path');

const drawioDir = path.join(__dirname, '..', 'docs', 'drawio');
const svgDir = path.join(__dirname, '..', 'docs');

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

// 1. GENERATE NATIVE DRAW.IO ER DIAGRAM (.drawio)
function generateDrawioER() {
  const tables = [
    {
      id: 'table_users',
      name: 'users',
      x: 60, y: 80, w: 220, h: 180,
      columns: [
        { name: 'id', type: 'INT', key: 'PK' },
        { name: 'name', type: 'VARCHAR(100)' },
        { name: 'email', type: 'VARCHAR(100)', key: 'UQ' },
        { name: 'password', type: 'VARCHAR(255)' },
        { name: 'role', type: 'VARCHAR(20)' },
        { name: 'created_at', type: 'TIMESTAMP' }
      ]
    },
    {
      id: 'table_orders',
      name: 'orders',
      x: 360, y: 80, w: 240, h: 210,
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
    {
      id: 'table_order_items',
      name: 'order_items',
      x: 680, y: 80, w: 220, h: 160,
      columns: [
        { name: 'id', type: 'INT', key: 'PK' },
        { name: 'order_id', type: 'VARCHAR(50)', key: 'FK' },
        { name: 'product_id', type: 'INT', key: 'FK' },
        { name: 'category_slug', type: 'VARCHAR(50)' },
        { name: 'price', type: 'DECIMAL(10,2)' }
      ]
    },
    {
      id: 'table_categories',
      name: 'categories',
      x: 60, y: 340, w: 220, h: 140,
      columns: [
        { name: 'id', type: 'INT', key: 'PK' },
        { name: 'slug', type: 'VARCHAR(50)', key: 'UQ' },
        { name: 'name_th', type: 'VARCHAR(100)' },
        { name: 'description', type: 'TEXT' },
        { name: 'created_at', type: 'TIMESTAMP' }
      ]
    },
    {
      id: 'table_products',
      name: 'products',
      x: 360, y: 340, w: 240, h: 210,
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
    {
      id: 'table_spec_cpu',
      name: 'spec_cpu',
      x: 680, y: 340, w: 220, h: 100,
      columns: [
        { name: 'product_id', type: 'INT', key: 'PK/FK' },
        { name: 'socket', type: 'VARCHAR(50)' },
        { name: 'tdp_watt', type: 'INT' }
      ]
    },
    {
      id: 'table_spec_mobo',
      name: 'spec_motherboard',
      x: 680, y: 470, w: 220, h: 100,
      columns: [
        { name: 'product_id', type: 'INT', key: 'PK/FK' },
        { name: 'socket', type: 'VARCHAR(50)' },
        { name: 'ram_type', type: 'VARCHAR(20)' }
      ]
    },
    {
      id: 'table_spec_ram',
      name: 'spec_ram',
      x: 680, y: 600, w: 220, h: 100,
      columns: [
        { name: 'product_id', type: 'INT', key: 'PK/FK' },
        { name: 'ram_type', type: 'VARCHAR(20)' },
        { name: 'capacity_gb', type: 'INT' }
      ]
    },
    {
      id: 'table_spec_gpu',
      name: 'spec_gpu',
      x: 360, y: 600, w: 220, h: 80,
      columns: [
        { name: 'product_id', type: 'INT', key: 'PK/FK' },
        { name: 'tdp_watt', type: 'INT' }
      ]
    },
    {
      id: 'table_spec_psu',
      name: 'spec_psu',
      x: 60, y: 600, w: 220, h: 80,
      columns: [
        { name: 'product_id', type: 'INT', key: 'PK/FK' },
        { name: 'wattage', type: 'INT' }
      ]
    },
    {
      id: 'table_spec_case',
      name: 'spec_case',
      x: 60, y: 710, w: 220, h: 80,
      columns: [
        { name: 'product_id', type: 'INT', key: 'PK/FK' },
        { name: 'form_factor_support', type: 'VARCHAR(255)' }
      ]
    }
  ];

  const relationships = [
    { from: 'table_users', to: 'table_orders', label: '1 : N', style: 'exitX=1;exitY=0.5;entryX=0;entryY=0.5;' },
    { from: 'table_orders', to: 'table_order_items', label: '1 : N', style: 'exitX=1;exitY=0.5;entryX=0;entryY=0.5;' },
    { from: 'table_products', to: 'table_order_items', label: '1 : N', style: 'exitX=1;exitY=0.2;entryX=0;entryY=0.8;' },
    { from: 'table_categories', to: 'table_products', label: '1 : N', style: 'exitX=1;exitY=0.5;entryX=0;entryY=0.5;' },
    { from: 'table_products', to: 'table_spec_cpu', label: '1 : 1', style: 'exitX=1;exitY=0.2;entryX=0;entryY=0.5;' },
    { from: 'table_products', to: 'table_spec_mobo', label: '1 : 1', style: 'exitX=1;exitY=0.8;entryX=0;entryY=0.5;' },
    { from: 'table_products', to: 'table_spec_ram', label: '1 : 1', style: 'exitX=1;exitY=0.9;entryX=0;entryY=0.5;' },
    { from: 'table_products', to: 'table_spec_gpu', label: '1 : 1', style: 'exitX=0.5;exitY=1;entryX=0.5;entryY=0;' },
    { from: 'table_products', to: 'table_spec_psu', label: '1 : 1', style: 'exitX=0;exitY=0.9;entryX=1;entryY=0.5;' },
    { from: 'table_products', to: 'table_spec_case', label: '1 : 1', style: 'exitX=0;exitY=0.95;entryX=1;entryY=0.5;' }
  ];

  let cellsXml = `        <mxCell id="0" />\n        <mxCell id="1" parent="0" />\n`;

  // Header Title
  cellsXml += `        <mxCell id="header" value="Smart PC Builder - Database ER Diagram (MySQL)" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=20;fontStyle=1;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="120" y="20" width="720" height="40" as="geometry" />
        </mxCell>\n`;

  // Render ER Table Boxes
  tables.forEach(tbl => {
    let colRowsHtml = `<b>${tbl.name.toUpperCase()}</b><hr/>`;
    tbl.columns.forEach(c => {
      const k = c.key ? `<b>[${c.key}]</b> ` : '';
      colRowsHtml += `${k}${c.name}: <i>${c.type}</i><br/>`;
    });

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

  const xmlContent = `<mxfile host="Electron" modified="${new Date().toISOString()}" agent="PCSpec ER Generator" version="21.0.0" type="device">
  <diagram id="diagram_er" name="ER Diagram (smart_pc_builder)">
    <mxGraphModel dx="1200" dy="1200" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="1654" math="0" shadow="0">
      <root>
${cellsXml}      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

  const drawioPath = path.join(drawioDir, 'smart_pc_builder_er_diagram.drawio');
  fs.writeFileSync(drawioPath, xmlContent, 'utf8');
  console.log('Created Draw.io ER file:', drawioPath);
}

// 2. GENERATE CLEAN MONOCHROME SVG ER DIAGRAM
function generateSvgER() {
  const svgWidth = 1000;
  const svgHeight = 850;

  const tables = [
    {
      name: 'users',
      x: 55, y: 80, w: 230, h: 185,
      columns: [
        { name: 'id', type: 'INT', key: 'PK' },
        { name: 'name', type: 'VARCHAR(100)' },
        { name: 'email', type: 'VARCHAR(100)', key: 'UQ' },
        { name: 'password', type: 'VARCHAR(255)' },
        { name: 'role', type: 'VARCHAR(20)' },
        { name: 'created_at', type: 'TIMESTAMP' }
      ]
    },
    {
      name: 'orders',
      x: 375, y: 80, w: 250, h: 230,
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
    {
      name: 'order_items',
      x: 715, y: 80, w: 230, h: 155,
      columns: [
        { name: 'id', type: 'INT', key: 'PK' },
        { name: 'order_id', type: 'VARCHAR(50)', key: 'FK' },
        { name: 'product_id', type: 'INT', key: 'FK' },
        { name: 'category_slug', type: 'VARCHAR(50)' },
        { name: 'price', type: 'DECIMAL(10,2)' }
      ]
    },
    {
      name: 'categories',
      x: 55, y: 350, w: 230, h: 155,
      columns: [
        { name: 'id', type: 'INT', key: 'PK' },
        { name: 'slug', type: 'VARCHAR(50)', key: 'UQ' },
        { name: 'name_th', type: 'VARCHAR(100)' },
        { name: 'description', type: 'TEXT' },
        { name: 'created_at', type: 'TIMESTAMP' }
      ]
    },
    {
      name: 'products',
      x: 375, y: 350, w: 250, h: 230,
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
    {
      name: 'spec_cpu',
      x: 715, y: 350, w: 230, h: 110,
      columns: [
        { name: 'product_id', type: 'INT', key: 'PK/FK' },
        { name: 'socket', type: 'VARCHAR(50)' },
        { name: 'tdp_watt', type: 'INT' }
      ]
    },
    {
      name: 'spec_motherboard',
      x: 715, y: 485, w: 230, h: 110,
      columns: [
        { name: 'product_id', type: 'INT', key: 'PK/FK' },
        { name: 'socket', type: 'VARCHAR(50)' },
        { name: 'ram_type', type: 'VARCHAR(20)' }
      ]
    },
    {
      name: 'spec_ram',
      x: 715, y: 620, w: 230, h: 110,
      columns: [
        { name: 'product_id', type: 'INT', key: 'PK/FK' },
        { name: 'ram_type', type: 'VARCHAR(20)' },
        { name: 'capacity_gb', type: 'INT' }
      ]
    },
    {
      name: 'spec_gpu',
      x: 375, y: 620, w: 250, h: 90,
      columns: [
        { name: 'product_id', type: 'INT', key: 'PK/FK' },
        { name: 'tdp_watt', type: 'INT' }
      ]
    },
    {
      name: 'spec_psu',
      x: 55, y: 620, w: 230, h: 90,
      columns: [
        { name: 'product_id', type: 'INT', key: 'PK/FK' },
        { name: 'wattage', type: 'INT' }
      ]
    },
    {
      name: 'spec_case',
      x: 55, y: 730, w: 230, h: 90,
      columns: [
        { name: 'product_id', type: 'INT', key: 'PK/FK' },
        { name: 'form_factor_support', type: 'VARCHAR(255)' }
      ]
    }
  ];

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}" style="background-color: #ffffff; font-family: 'Inter', system-ui, sans-serif;">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#000000" />
    </marker>
  </defs>

  <!-- Header -->
  <rect x="0" y="0" width="${svgWidth}" height="55" fill="#f8f9fa" stroke="#e9ecef" stroke-width="1"/>
  <text x="30" y="35" fill="#000000" font-size="18" font-weight="700">Smart PC Builder - Database ER Diagram (MySQL)</text>
  <text x="${svgWidth - 250}" y="35" fill="#495057" font-size="12" font-weight="600">✓ Black &amp; White Academic Theme</text>

  <!-- Connection Lines -->
  <!-- users -> orders -->
  <path d="M 285 140 L 375 140" stroke="#000000" stroke-width="1.8" marker-end="url(#arrow)" />
  <rect x="310" y="128" width="40" height="20" rx="3" fill="#ffffff" stroke="#000000" stroke-width="1"/>
  <text x="317" y="142" font-size="11" font-weight="700" fill="#000000">1 : N</text>

  <!-- orders -> order_items -->
  <path d="M 625 140 L 715 140" stroke="#000000" stroke-width="1.8" marker-end="url(#arrow)" />
  <rect x="650" y="128" width="40" height="20" rx="3" fill="#ffffff" stroke="#000000" stroke-width="1"/>
  <text x="657" y="142" font-size="11" font-weight="700" fill="#000000">1 : N</text>

  <!-- categories -> products -->
  <path d="M 285 410 L 375 410" stroke="#000000" stroke-width="1.8" marker-end="url(#arrow)" />
  <rect x="310" y="398" width="40" height="20" rx="3" fill="#ffffff" stroke="#000000" stroke-width="1"/>
  <text x="317" y="412" font-size="11" font-weight="700" fill="#000000">1 : N</text>

  <!-- products -> order_items -->
  <path d="M 625 390 L 670 390 L 670 190 L 715 190" fill="none" stroke="#000000" stroke-width="1.8" marker-end="url(#arrow)" />
  <rect x="650" y="280" width="40" height="20" rx="3" fill="#ffffff" stroke="#000000" stroke-width="1"/>
  <text x="657" y="294" font-size="11" font-weight="700" fill="#000000">1 : N</text>

  <!-- products -> spec_cpu -->
  <path d="M 625 410 L 715 410" stroke="#000000" stroke-width="1.8" marker-end="url(#arrow)" />
  <rect x="650" y="398" width="40" height="20" rx="3" fill="#ffffff" stroke="#000000" stroke-width="1"/>
  <text x="657" y="412" font-size="11" font-weight="700" fill="#000000">1 : 1</text>

  <!-- products -> spec_motherboard -->
  <path d="M 625 535 L 715 535" stroke="#000000" stroke-width="1.8" marker-end="url(#arrow)" />
  <rect x="650" y="523" width="40" height="20" rx="3" fill="#ffffff" stroke="#000000" stroke-width="1"/>
  <text x="657" y="537" font-size="11" font-weight="700" fill="#000000">1 : 1</text>

  <!-- products -> spec_ram -->
  <path d="M 625 560 L 670 560 L 670 660 L 715 660" fill="none" stroke="#000000" stroke-width="1.8" marker-end="url(#arrow)" />

  <!-- products -> spec_gpu -->
  <path d="M 500 580 L 500 620" stroke="#000000" stroke-width="1.8" marker-end="url(#arrow)" />

  <!-- products -> spec_psu -->
  <path d="M 375 560 L 330 560 L 330 660 L 285 660" fill="none" stroke="#000000" stroke-width="1.8" marker-end="url(#arrow)" />

  <!-- products -> spec_case -->
  <path d="M 375 570 L 310 570 L 310 760 L 285 760" fill="none" stroke="#000000" stroke-width="1.8" marker-end="url(#arrow)" />
`;

  // Draw Entity Tables
  tables.forEach(tbl => {
    svgContent += `  <!-- Table: ${tbl.name} -->
  <g>
    <rect x="${tbl.x}" y="${tbl.y}" width="${tbl.w}" height="${tbl.h}" rx="6" fill="#ffffff" stroke="#000000" stroke-width="2"/>
    <rect x="${tbl.x}" y="${tbl.y}" width="${tbl.w}" height="30" rx="6" fill="#f1f3f5" stroke="#000000" stroke-width="2"/>
    <text x="${tbl.x + tbl.w / 2}" y="${tbl.y + 20}" font-size="14" font-weight="700" fill="#000000" text-anchor="middle">${tbl.name.toUpperCase()}</text>\n`;

    tbl.columns.forEach((col, idx) => {
      const colY = tbl.y + 48 + idx * 22;
      const keyTag = col.key ? `[${col.key}] ` : '';
      const fontWeight = col.key ? '700' : '400';
      svgContent += `    <text x="${tbl.x + 12}" y="${colY}" font-size="12" font-weight="${fontWeight}" fill="#000000">${keyTag}${col.name}</text>
    <text x="${tbl.x + tbl.w - 12}" y="${colY}" font-size="11" font-weight="400" fill="#495057" text-anchor="end">${col.type}</text>\n`;
    });

    svgContent += `  </g>\n`;
  });

  svgContent += `</svg>`;

  const svgPath = path.join(svgDir, 'er_diagram.svg');
  fs.writeFileSync(svgPath, svgContent, 'utf8');
  console.log('Created SVG ER file:', svgPath);
}

generateDrawioER();
generateSvgER();
