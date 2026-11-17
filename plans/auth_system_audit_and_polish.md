# Auth System Audit & Polish Technical Plan (PCSpec)

## 1. Architecture & File Mapping
- **Frontend Auth Modal**: [frontend/src/App.vue](file:///f:/Projects/PCSpec/frontend/src/App.vue)
- **Pinia Auth Store**: [frontend/src/stores/auth.js](file:///f:/Projects/PCSpec/frontend/src/stores/auth.js)
- **Backend Auth Controller**: [node-backend/controllers/authController.js](file:///f:/Projects/PCSpec/node-backend/controllers/authController.js)
- **User Data Model**: [node-backend/models/userModel.js](file:///f:/Projects/PCSpec/node-backend/models/userModel.js)

---

## 2. Audit Findings & Improvements Landed
1. **Form Semantic & Native Auto-fill Support**:
   - Replaced plain `<div>` containers with semantic `<form @submit.prevent="...">`.
   - Added `autocomplete="email"`, `autocomplete="current-password"`, `autocomplete="new-password"`, `autocomplete="name"`, `autocapitalize="none"`, and `spellcheck="false"`.
   - Enabled browser password managers (Chrome, Edge, 1Password, Bitwarden, iCloud Keychain) to seamlessly save and suggest credentials.
2. **Keyboard Accessibility (Enter Key Submit)**:
   - Form inputs now naturally submit on pressing `Enter` without requiring manual click on both Login and Register tabs.
3. **Double-submit Prevention & Loading State**:
   - Added `isSubmitting` reactive flag.
   - Disables submit buttons during in-flight network requests and displays feedback: `กำลังเข้าสู่ระบบ...` / `กำลังสร้างบัญชี...`.
4. **Password Length Hint & Proactive Validation**:
   - Added `.form-hint` displaying `อย่างน้อย 6 ตัวอักษร` in the registration form.
   - Proactive client-side validation prevents unnecessary roundtrips when password is under 6 characters.
5. **Show/Hide Password Toggle**:
   - Implemented toggle button (👁️ / 👁️‍🗨️) inside password input fields on both Login and Register tabs.
   - Cleanly positioned with hairline border and accessible `aria-label`.

---

## 3. Testing & Verification Checklist
- [x] **Vitest Frontend Suites**: 25/25 files passed (186/186 tests).
- [x] **Jest Backend Suites**: 19/19 files passed (172/172 tests).
- [x] **End-to-End Edge Playwright Test**: `scratch/test_auth_flow.cjs` passed.
  - Admin login (`admin@pcspec.dev / admin123`) -> redirect to `/admin`.
  - Admin logout -> returns to guest navbar state.
  - Customer registration -> creates user, logs in, shows `👤 สมชาย สายเทส` in navbar.
- [x] **Screenshots Captured**:
  - `audit_auth_login_tab.png`: Polished login tab with eye toggle.
  - `audit_auth_register_tab.png`: Polished register tab with hint and eye toggle.
  - `audit_auth_mobile_modal.png`: Mobile centered responsive rendering.
  - `audit_auth_admin_loggedin.png`: Admin authenticated navbar and dashboard.
  - `audit_auth_customer_registered.png`: Registered customer state.
