# Compatibility Checker Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update `hardwareController.js` and `builder.js` store to use typed spec columns for real-time PC compatibility checks, component clearance, and storage speed highlights.

**Architecture:** Update `hardwareController.getCatalog` SQL query and object formatter in Node.js backend. Update Pinia getters `compatibilityIssues` and `compatibilityPasses` in `builder.js`.

**Tech Stack:** Node.js, Express, Vue 3 (Pinia), Vitest, Jest.

---

### Task 1: Update Backend Catalog API Controller

**Files:**
- Modify: `node-backend/controllers/hardwareController.js`

- [ ] **Step 1: Update `getCatalog` in `hardwareController.js`**

Update `getCatalog` query to include all typed spec columns (`st.type`, `st.capacity_gb`, `st.read_speed_mbs`, `st.write_speed_mbs`, `c.cores`, `c.threads`, `m.form_factor`, `r.bus_speed`, `psu.efficiency_rating`, `case_spec.form_factor_support`, `case_spec.max_gpu_length_mm`).

Formatted properties per category:
- `cpu`: `socket`, `tdp`, `cores`, `threads`
- `mobo`: `socket`, `ramType`, `formFactor`
- `ram`: `type`, `capacityGb`, `busSpeed`
- `gpu`: `tdp`, `chipset`, `vramGb`, `lengthMm`
- `storage`: `type`, `capacityGb`, `readSpeedMbs`, `writeSpeedMbs`
- `psu`: `wattage`, `efficiencyRating`
- `case`: `formFactorSupport`, `maxGpuLength`

- [ ] **Step 2: Verify Backend Tests**

Run: `cd node-backend && npm test`
Expected: All Jest tests pass.

---

### Task 2: Update Frontend Builder Store & Compatibility Checker

**Files:**
- Modify: `frontend/src/stores/builder.js`
- Modify: `frontend/tests/builderStore.test.js`

- [ ] **Step 1: Update `compatibilityIssues` and `compatibilityPasses` in `builder.js`**

Enhance `builder.js` getters to utilize `lengthMm`, `maxGpuLength`, `formFactor`, `formFactorSupport`, `readSpeedMbs`, `writeSpeedMbs` directly from items.

- [ ] **Step 2: Add Unit Tests in `frontend/tests/builderStore.test.js`**

Add tests covering typed spec compatibility checks (Storage speed highlight, GPU length clearance, Form Factor checks).

- [ ] **Step 3: Run Vitest Unit Tests**

Run: `cd frontend && npm test`
Expected: All Vitest unit tests pass.

- [ ] **Step 4: Commit Changes**

```bash
git add node-backend/controllers/hardwareController.js frontend/src/stores/builder.js frontend/tests/builderStore.test.js
git commit -m "feat: integrate typed spec tables into catalog API and compatibility checker"
```
