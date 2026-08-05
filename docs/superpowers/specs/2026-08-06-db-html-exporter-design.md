# Design Document: MySQL Database HTML Exporter (`database_view.html`)

**Date:** 2026-08-06  
**Status:** Approved  

## 1. Overview
The goal of this feature is to allow developers and administrators to view the complete content of all MySQL database tables (`smart_pc_builder`) in a clean, standalone, zero-dependency HTML file (`database_view.html`) without needing third-party database management software (e.g. MySQL Workbench, DBeaver, phpMyAdmin).

## 2. Architecture & Data Flow
1. **Node.js Export Script (`node-backend/scripts/export_db_to_html.js`):**
   - Connects to MySQL using credentials from `node-backend/.env` (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).
   - Executes `SHOW TABLES` to dynamically discover all tables in `smart_pc_builder`.
   - For each table, queries `SELECT * FROM \`table_name\``.
   - Sanitizes sensitive fields (e.g., masks `password` hashes in `users` table as `••••••••`).
   - Formats JSON fields (e.g., `specifications`) gracefully for visual rendering.
   - Generates a single standalone `database_view.html` file in the workspace root directory.

2. **NPM Script Command:**
   - Adds `"export-db": "node scripts/export_db_to_html.js"` to `node-backend/package.json`.
   - Running `npm run export-db` inside `node-backend` generates/updates `database_view.html`.

## 3. UI/UX Specifications (`database_view.html`)
- **Theme:** Modern Dark Canvas with Emerald Accent (Supabase-inspired aesthetic).
- **Header:**
  - Database name: `smart_pc_builder`
  - Total Tables count & Total Records count
  - Generation timestamp (e.g. `2026-08-06 00:26:00`)
- **Navigation:**
  - Top tabbed navigation bar for switching between tables (`hardware_items`, `users`, `orders`, `articles`, etc.).
  - Each tab badge shows the row count for that table.
- **Controls:**
  - Real-time search bar to filter table rows instantly across all columns.
  - Table column sort & auto scrollable table container.
- **Cell Renderers:**
  - **Images:** Displays a 40x40 thumbnail preview if a cell contains an image path/URL.
  - **JSON Data:** Formatted as readable key-value badges instead of raw JSON strings.
  - **Null/Empty:** Rendered with subtle mute indicators.

## 4. Security Considerations
- Sensitive fields like user password hashes are masked (`••••••••`) by default during export.
- `database_view.html` is added to `.gitignore` to prevent committing live database snapshots to source control.

## 5. Verification Plan
- Run `npm run export-db` from `node-backend`.
- Confirm `database_view.html` is generated without errors.
- Open `database_view.html` in a web browser to verify all tables, tabs, search functionality, and images display correctly.
