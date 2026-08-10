require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function exportDatabase() {
  console.log('🔌 Connecting to MySQL database...');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'smart_pc_builder',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined
  });

  console.log('🔍 Fetching database tables...');
  const [tableRows] = await connection.query('SHOW TABLES');
  const dbName = process.env.DB_NAME || 'smart_pc_builder';
  const tableKey = `Tables_in_${dbName}`;

  const databaseData = {};
  let totalRecords = 0;

  for (const row of tableRows) {
    const tableName = row[tableKey] || Object.values(row)[0];
    console.log(`📦 Exporting table: ${tableName}`);
    const [rows] = await connection.query(`SELECT * FROM \`${tableName}\``);
    
    // Mask sensitive fields and parse JSON string columns if needed
    const sanitizedRows = rows.map(r => {
      const cleanRow = { ...r };
      if ('password' in cleanRow) {
        cleanRow.password = '••••••••';
      }
      if (typeof cleanRow.specifications === 'string') {
        try {
          cleanRow.specifications = JSON.parse(cleanRow.specifications);
        } catch(e) {}
      }
      return cleanRow;
    });

    databaseData[tableName] = sanitizedRows;
    totalRecords += sanitizedRows.length;
  }

  await connection.end();

  const exportDir = path.join(__dirname, '../../database-export');
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  // Save JSON dump
  const jsonPath = path.join(exportDir, 'all_database_data.json');
  fs.writeFileSync(jsonPath, JSON.stringify(databaseData, null, 2), 'utf8');
  console.log(`✅ Saved JSON dump to: ${jsonPath}`);

  const generatedAt = new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'medium' });

  const htmlContent = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Database Inspector — ${dbName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090d16;
      --card: #111827;
      --card-soft: #1f2937;
      --border: #374151;
      --text: #f9fafb;
      --text-mute: #9ca3af;
      --primary: #10b981;
      --primary-soft: rgba(16, 185, 129, 0.15);
      --font-sans: 'Inter', sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-sans);
      padding: 1.5rem;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      margin-bottom: 1.5rem;
    }
    .title-area { display: flex; align-items: center; gap: 0.75rem; }
    .db-icon {
      width: 40px; height: 40px;
      border-radius: 8px;
      background: var(--primary-soft);
      color: var(--primary);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.25rem; font-weight: 700;
    }
    .db-title { font-size: 1.25rem; font-weight: 600; }
    .db-sub { font-size: 0.85rem; color: var(--text-mute); }
    .stats-area { display: flex; gap: 1.5rem; font-size: 0.85rem; color: var(--text-mute); }
    .stat-badge { color: var(--primary); font-weight: 600; }
    
    .nav-tabs {
      display: flex; gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 0.5rem;
      margin-bottom: 1rem;
      border-bottom: 1px solid var(--border);
    }
    .tab-btn {
      background: var(--card);
      border: 1px solid var(--border);
      color: var(--text-mute);
      padding: 0.6rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      display: flex; align-items: center; gap: 0.5rem;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .tab-btn:hover { background: var(--card-soft); color: var(--text); }
    .tab-btn.active {
      background: var(--primary-soft);
      border-color: var(--primary);
      color: var(--primary);
    }
    .tab-count {
      background: rgba(255,255,255,0.1);
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      font-size: 0.75rem;
    }
    
    .controls-bar {
      display: flex; gap: 1rem;
      margin-bottom: 1rem;
    }
    .search-input {
      flex: 1;
      background: var(--card);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 0.6rem 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
      outline: none;
    }
    .search-input:focus { border-color: var(--primary); }
    
    .table-container {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow-x: auto;
      max-height: 70vh;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
      text-align: left;
    }
    th {
      background: #1e293b;
      color: var(--text-mute);
      padding: 0.75rem 1rem;
      font-weight: 600;
      position: sticky; top: 0;
      border-bottom: 1px solid var(--border);
      white-space: nowrap;
    }
    td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      vertical-align: top;
      max-width: 350px;
      word-break: break-word;
    }
    tr:hover { background: rgba(255,255,255,0.02); }
    
    .cell-img {
      width: 36px; height: 36px;
      border-radius: 6px;
      object-fit: contain;
      background: #fff;
    }
    .cell-json {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: #38bdf8;
      background: #0f172a;
      padding: 0.4rem;
      border-radius: 6px;
      white-space: pre-wrap;
    }
    .cell-null { color: #64748b; font-style: italic; }
    .cell-masked { color: #f43f5e; font-family: var(--font-mono); }
  </style>
</head>
<body>
  <div class="header">
    <div class="title-area">
      <div class="db-icon">🗄️</div>
      <div>
        <div class="db-title">${dbName}</div>
        <div class="db-sub">อัปเดตล่าสุด: ${generatedAt}</div>
      </div>
    </div>
    <div class="stats-area">
      <div>ตารางทั้งหมด: <span class="stat-badge">${Object.keys(databaseData).length}</span></div>
      <div>รายการทั้งหมด: <span class="stat-badge">${totalRecords}</span></div>
    </div>
  </div>

  <div class="nav-tabs" id="tabs"></div>

  <div class="controls-bar">
    <input type="text" id="searchInput" class="search-input" placeholder="🔍 ค้นหาข้อมูลในตารางนี้..." oninput="filterTable()">
  </div>

  <div class="table-container" id="tableContainer"></div>

  <script>
    const dbData = ${JSON.stringify(databaseData)};
    let activeTable = Object.keys(dbData)[0] || '';

    function renderTabs() {
      const tabsEl = document.getElementById('tabs');
      tabsEl.innerHTML = '';
      Object.keys(dbData).forEach(tableName => {
        const btn = document.createElement('button');
        btn.className = 'tab-btn' + (tableName === activeTable ? ' active' : '');
        btn.onclick = () => switchTable(tableName);
        btn.innerHTML = \`\${tableName} <span class="tab-count">\${dbData[tableName].length}</span>\`;
        tabsEl.appendChild(btn);
      });
    }

    function switchTable(tableName) {
      activeTable = tableName;
      document.getElementById('searchInput').value = '';
      renderTabs();
      renderTable();
    }

    function renderTable() {
      const container = document.getElementById('tableContainer');
      const rows = dbData[activeTable] || [];
      const query = document.getElementById('searchInput').value.toLowerCase();

      const filteredRows = rows.filter(r => {
        if (!query) return true;
        return Object.values(r).some(val => 
          val !== null && String(val).toLowerCase().includes(query)
        );
      });

      if (filteredRows.length === 0) {
        container.innerHTML = '<div style="padding: 3rem; text-align: center; color: #9ca3af;">ไม่พบข้อมูล</div>';
        return;
      }

      const columns = Object.keys(rows[0] || {});
      let html = '<table><thead><tr>';
      columns.forEach(col => { html += \`<th>\${col}</th>\`; });
      html += '</tr></thead><tbody>';

      filteredRows.forEach(row => {
        html += '<tr>';
        columns.forEach(col => {
          const val = row[col];
          html += '<td>' + formatCell(col, val) + '</td>';
        });
        html += '</tr>';
      });

      html += '</tbody></table>';
      container.innerHTML = html;
    }

    function formatCell(col, val) {
      if (val === null || val === undefined) return '<span class="cell-null">null</span>';
      if (val === '••••••••') return '<span class="cell-masked">••••••••</span>';
      if (typeof val === 'object') return '<div class="cell-json">' + JSON.stringify(val, null, 2) + '</div>';
      
      const strVal = String(val);
      if (strVal.startsWith('{') || strVal.startsWith('[')) {
        try {
          const parsed = JSON.parse(strVal);
          return '<div class="cell-json">' + JSON.stringify(parsed, null, 2) + '</div>';
        } catch(e) {}
      }

      if (typeof strVal === 'string' && (strVal.endsWith('.jpg') || strVal.endsWith('.png') || strVal.endsWith('.webp') || strVal.includes('/images/'))) {
        return \`<div style="display:flex;align-items:center;gap:0.5rem;"><img src="\${strVal}" class="cell-img" onerror="this.style.display='none'"><span>\${strVal}</span></div>\`;
      }

      return strVal;
    }

    function filterTable() {
      renderTable();
    }

    // Init
    if (activeTable) {
      renderTabs();
      renderTable();
    }
  </script>
</body>
</html>`;

  const htmlPath = path.join(exportDir, 'database_view.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  console.log(`✅ Successfully exported HTML inspector to: ${htmlPath}`);
}

exportDatabase().catch(err => {
  console.error('❌ Failed to export database:', err);
  process.exit(1);
});
