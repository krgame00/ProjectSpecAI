# Top Navigation Bar Layout and Hierarchy Polish (PCSpec)

## Overview & Objectives
Address UX and aesthetic issues identified in the top navigation bar when logged in as an administrator:
1. **Visual Hierarchy Balance**: Replace the glaring solid green button on "หลังบ้านแอดมิน" with a refined emerald soft-outline pill (`.btn-admin-nav`).
2. **Clear Zone Separation**: Introduce a clean vertical divider between primary storefront navigation links and user account controls.
3. **Admin Identity Display**: Ensure the logged-in admin's identity is clearly displayed with an `ADMIN` role badge.
4. **Subdued Logout Action**: Replace aggressive red outline with a courteous ghost utility button that transitions to danger accents only on hover.

---

## 1. File & Architecture Mapping
- [frontend/src/App.vue](file:///f:/Projects/PCSpec/frontend/src/App.vue): Nav template structure, user actions, responsive mobile styles.
- [frontend/src/style.css](file:///f:/Projects/PCSpec/frontend/src/style.css): Global navigation tokens, divider, role badge, and button styles.

---

## 3. Verification & Testing Checklist
- [x] **Visual Hierarchy Balance**: "หลังบ้านแอดมิน" styled with `.btn-admin-nav` soft emerald outline, no longer screaming bright solid green.
- [x] **Zone Separation**: `.nav-divider` divides store navigation and account actions on desktop (vertical) and mobile (horizontal).
- [x] **Admin Identity**: `currentUser.name` + `ADMIN` badge displayed in `.user-profile-badge`.
- [x] **Ghost Logout**: `.btn-logout` in muted resting state, turns soft red only on hover.
- [x] **Automated Tests**: Vitest 186/186 tests green, Production build passed.
- [x] **Edge Visual Artifacts**:
  - Desktop Close-up: `navbar_admin_closeup.png`.
  - Mobile Drawer: `navbar_admin_mobile.png`.
