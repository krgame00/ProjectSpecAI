# Design Document: Compatibility Checker Integration with Typed Spec Tables

**Date:** 2026-08-07  
**Status:** Approved  

## 1. Overview
The goal of this design is to update `node-backend/controllers/hardwareController.js` and `frontend/src/stores/builder.js` to utilize the strongly-typed columns from the 7 `spec_*` MySQL tables for real-time PC compatibility checks (Socket, RAM Type, PSU Wattage vs TDP, GPU Length vs Case clearance, Storage Speed & Type, Form Factors).

## 2. API Schema Updates (`node-backend/controllers/hardwareController.js`)
Update `getCatalog` to select and format all spec fields from `spec_*` tables:

- **CPU:** `socket`, `cores`, `threads`, `tdp`
- **Motherboard:** `socket`, `ramType`, `formFactor`
- **RAM:** `ramType` (or `type`), `capacityGb`, `busSpeed`
- **GPU:** `chipset`, `vramGb`, `tdp`, `lengthMm`
- **Storage:** `type`, `capacityGb`, `readSpeedMbs`, `writeSpeedMbs`
- **PSU:** `wattage`, `efficiencyRating`
- **Case:** `formFactorSupport`, `maxGpuLengthMm`

## 3. Frontend Compatibility Store Updates (`frontend/src/stores/builder.js`)
Update `compatibilityIssues` and `compatibilityPasses` getters in Pinia `builder` store:

1. **CPU & Motherboard Socket Match:**
   - Compares `cCpu.socket` vs `cMobo.socket`.
2. **RAM & Motherboard RAM Type Match:**
   - Compares `cMobo.ramType` vs `cRam.type` (or `cRam.ramType`).
3. **PSU Wattage vs Total System TDP:**
   - Calculates TDP using `cCpu.tdp`, `cGpu.tdp` + motherboard/RAM/storage baselines.
   - Compares `cPsu.wattage` against recommended wattage (`totalTdp * 1.3`).
4. **GPU Length vs Case Clearance:**
   - Uses `cGpu.lengthMm` and `cCase.maxGpuLengthMm` directly.
5. **Form Factor Compatibility:**
   - Evaluates `cMobo.formFactor` vs `cCase.formFactorSupport`.
6. **Storage Speed & Status Indicator:**
   - Highlights storage capacity and read/write speeds (`readSpeedMbs`, `writeSpeedMbs`) when selected in the build passes summary.

## 4. Verification Plan
- Run `npm test` in `node-backend` to ensure catalog API tests pass.
- Run `npm test` in `frontend` to ensure vitest builderStore and UI tests pass.
- Execute Playwright E2E tests (`npm run test:e2e`) to verify full builder & checkout flows.
