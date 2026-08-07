# Design Document: Strongly Typed Hardware Component Specification Tables

**Date:** 2026-08-07  
**Status:** Approved  

## 1. Overview
The goal of this design is to establish 7 dedicated, strongly-typed component specification tables in MySQL (`smart_pc_builder`) to support strict technical compatibility checks (e.g. CPU Socket vs Motherboard Socket, TDP wattage summation, RAM type matching) and fast indexing while maintaining the master `products` table for shared attributes.

An automated Node.js migration script will extract structured fields from existing JSON `specifications` across all 272 products and populate these 7 tables automatically.

## 2. Database Schema (MySQL)

### Master Tables
- `categories`: `id` (PK), `slug` (UNIQUE), `name_th`, `description`, `created_at`
- `products`: `id` (PK), `category_id` (FK -> `categories.id`), `brand`, `model`, `price`, `image_url`, `stock_quantity`, `specifications` (JSON), `created_at`

### 7 Component Specification Tables (1-to-1 Relationship with `products`)
1. **`spec_cpu`**
   - `product_id` (INT, PK, FK -> `products.id` ON DELETE CASCADE)
   - `socket` (VARCHAR 50, e.g. 'AM4', 'AM5', 'LGA1700')
   - `cores` (INT, e.g. 6, 8, 16)
   - `threads` (INT, e.g. 12, 16, 24)
   - `tdp_watt` (INT, e.g. 65, 125)

2. **`spec_motherboard`**
   - `product_id` (INT, PK, FK -> `products.id` ON DELETE CASCADE)
   - `socket` (VARCHAR 50, e.g. 'AM5', 'LGA1700')
   - `ram_type` (VARCHAR 20, e.g. 'DDR4', 'DDR5')
   - `form_factor` (VARCHAR 50, e.g. 'ATX', 'Micro-ATX', 'Mini-ITX')

3. **`spec_ram`**
   - `product_id` (INT, PK, FK -> `products.id` ON DELETE CASCADE)
   - `ram_type` (VARCHAR 20, e.g. 'DDR4', 'DDR5')
   - `capacity_gb` (INT, e.g. 16, 32, 64)
   - `bus_speed` (INT, e.g. 3200, 5600, 6000)

4. **`spec_gpu`**
   - `product_id` (INT, PK, FK -> `products.id` ON DELETE CASCADE)
   - `chipset` (VARCHAR 100, e.g. 'RTX 4060', 'RTX 5080')
   - `vram_gb` (INT, e.g. 8, 16, 32)
   - `tdp_watt` (INT, e.g. 115, 300, 450)
   - `length_mm` (INT, e.g. 227, 340)

5. **`spec_storage`**
   - `product_id` (INT, PK, FK -> `products.id` ON DELETE CASCADE)
   - `type` (VARCHAR 50, e.g. 'M.2 NVMe PCIe 4.0', 'SATA SSD', 'HDD')
   - `capacity_gb` (INT, e.g. 512, 1000, 2000)
   - `read_speed_mbs` (INT, e.g. 5000, 7400)
   - `write_speed_mbs` (INT, e.g. 2500, 6500)

6. **`spec_psu`**
   - `product_id` (INT, PK, FK -> `products.id` ON DELETE CASCADE)
   - `wattage` (INT, e.g. 650, 750, 850, 1000)
   - `efficiency_rating` (VARCHAR 50, e.g. '80 Plus Bronze', '80 Plus Gold')

7. **`spec_case`**
   - `product_id` (INT, PK, FK -> `products.id` ON DELETE CASCADE)
   - `form_factor_support` (VARCHAR 255, e.g. 'ATX, Micro-ATX, Mini-ITX')
   - `max_gpu_length_mm` (INT, e.g. 350, 400)

## 3. Data Migration & Extraction Script (`node-backend/scripts/populate_typed_specs.js`)
- Connects to MySQL using `node-backend/.env`.
- Ensures all 7 `spec_*` tables exist (creates them if missing).
- Iterates over all 272 products from `products` table.
- Parses `specifications` JSON and extracts structured attributes using Regex / JSON keys:
  - CPU: Socket, Cores, Threads, TDP
  - Motherboard: CPU Socket, Memory Type, Form Factor
  - RAM: Memory Type, Capacity, Speed
  - GPU: Memory Size, TDP / Power Requirement, Length / Dimension
  - Storage: Capacity, Read Speed, Write Speed, Interface / Type
  - PSU: Wattage / Power Requirement, Efficiency
  - Case: Form Factor, Max GPU Length
- Inserts/Updates extracted values into respective `spec_*` tables using `ON DUPLICATE KEY UPDATE`.

## 4. API & Backend Integration (`node-backend/controllers/hardwareController.js`)
- Updates `hardwareController.getCatalog` to query `products` joined with `categories` and `spec_*` tables.
- Formats fields returned to frontend (`socket`, `tdp`, `ramType`, `wattage`, `capacity_gb`, `read_speed_mbs`, `write_speed_mbs`, etc.).

## 5. Exporter & Viewer Update
- Updates `node-backend/scripts/export_db_to_html.js` to reflect populated data in `database-export/database_view.html` and `database-export/all_database_data.json`.

## 6. Verification Plan
- Run `node node-backend/scripts/populate_typed_specs.js` to populate spec tables.
- Run `npm test` in `node-backend` to ensure catalog API tests pass.
- Run `npm run export-db` to verify all 7 `spec_*` tables are populated in `database_view.html`.
