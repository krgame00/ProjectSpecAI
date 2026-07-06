# Builder Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the Vue 3 monolith into a scalable architecture using Pinia for state management.

**Architecture:** We will extract all global state from `App.vue` into three Pinia stores: `auth`, `catalog`, and `builder`. `App.vue` will become a layout shell, and components will reactively consume the stores.

**Tech Stack:** Vue 3, Pinia, Vitest (for TDD).

## Global Constraints

- Vue Composition API (`<script setup>`) must be used.
- All backend requests must use `http://localhost:3000/api/...`
- Tests must be written before implementation code.

---

### Task 1: Install Pinia & Vitest Setup

**Files:**
- Modify: `c:/Users/PC/Downloads/PCSpec/frontend/package.json`
- Modify: `c:/Users/PC/Downloads/PCSpec/frontend/src/main.js`
- Create: `c:/Users/PC/Downloads/PCSpec/frontend/vite.config.js` (if needed to add test property)

**Interfaces:**
- Produces: Pinia installed and registered in Vue. Vitest runnable via `npm run test`.

- [ ] **Step 1: Install dependencies**

```powershell
cd c:\Users\PC\Downloads\PCSpec\frontend
npm install pinia
npm install -D vitest @vue/test-utils jsdom
```

- [ ] **Step 2: Update package.json scripts**

Modify `package.json` to add `"test": "vitest run"` to scripts.

- [ ] **Step 3: Register Pinia in main.js**

Modify `src/main.js`:
```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
```

- [ ] **Step 4: Commit**

```powershell
git add package.json package-lock.json src/main.js
git commit -m "chore: setup pinia and vitest"
```

---

### Task 2: Create Auth Store

**Files:**
- Create: `c:/Users/PC/Downloads/PCSpec/frontend/src/stores/auth.js`
- Create: `c:/Users/PC/Downloads/PCSpec/frontend/tests/authStore.test.js`

**Interfaces:**
- Produces: `useAuthStore` with `user`, `token`, `login()`, `logout()`, `isAuthenticated()`.

- [ ] **Step 1: Write the failing test**

```javascript
// tests/authStore.test.js
import { setActivePinia, createPinia } from 'pinia'
import { expect, test, beforeEach } from 'vitest'
import { useAuthStore } from '../src/stores/auth'

beforeEach(() => {
  setActivePinia(createPinia())
})

test('auth store sets token and user', () => {
  const auth = useAuthStore()
  auth.token = 'abc'
  expect(auth.isAuthenticated).toBe(true)
  auth.logout()
  expect(auth.isAuthenticated).toBe(false)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd c:\Users\PC\Downloads\PCSpec\frontend && npm run test tests/authStore.test.js`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```javascript
// src/stores/auth.js
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin'
  },
  actions: {
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
})
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd c:\Users\PC\Downloads\PCSpec\frontend && npm run test tests/authStore.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```powershell
git add src/stores/auth.js tests/authStore.test.js
git commit -m "feat: add auth store"
```

---

### Task 3: Create Catalog Store

**Files:**
- Create: `c:/Users/PC/Downloads/PCSpec/frontend/src/stores/catalog.js`
- Create: `c:/Users/PC/Downloads/PCSpec/frontend/tests/catalogStore.test.js`

**Interfaces:**
- Produces: `useCatalogStore` with `hardwareList` state and `fetchCatalog` action.

- [ ] **Step 1: Write failing test**

```javascript
// tests/catalogStore.test.js
import { setActivePinia, createPinia } from 'pinia'
import { expect, test, beforeEach } from 'vitest'
import { useCatalogStore } from '../src/stores/catalog'

beforeEach(() => { setActivePinia(createPinia()) })

test('catalog store fetches data', async () => {
  const catalogStore = useCatalogStore()
  // Mock global fetch
  global.fetch = () => Promise.resolve({
    ok: true,
    json: () => Promise.resolve([{ id: 1, name: 'CPU 1', category: 'cpu' }])
  })
  await catalogStore.fetchCatalog()
  expect(catalogStore.hardwareList.length).toBe(1)
  expect(catalogStore.hardwareList[0].name).toBe('CPU 1')
})
```

- [ ] **Step 2: Run test**
Run `npm run test tests/catalogStore.test.js`. Expected FAIL.

- [ ] **Step 3: Implement store**

```javascript
// src/stores/catalog.js
import { defineStore } from 'pinia'

export const useCatalogStore = defineStore('catalog', {
  state: () => ({
    hardwareList: [],
    isLoading: false
  }),
  getters: {
    getCategorizedHardware: (state) => {
      const catalog = {}
      state.hardwareList.forEach(item => {
        if (!catalog[item.category]) catalog[item.category] = []
        catalog[item.category].push(item)
      })
      return catalog
    }
  },
  actions: {
    async fetchCatalog() {
      this.isLoading = true
      try {
        const res = await fetch('http://localhost:3000/api/hardware/catalog')
        if (res.ok) {
          this.hardwareList = await res.json()
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.isLoading = false
      }
    }
  }
})
```

- [ ] **Step 4: Run test**
Expected PASS.

- [ ] **Step 5: Commit**

---

### Task 4: Create Builder Store

**Files:**
- Create: `c:/Users/PC/Downloads/PCSpec/frontend/src/stores/builder.js`
- Create: `c:/Users/PC/Downloads/PCSpec/frontend/tests/builderStore.test.js`

**Interfaces:**
- Produces: `useBuilderStore` holding `build` state, `selectItem`, and `compatibilityIssues`.

- [ ] **Step 1: Write failing test**

```javascript
// tests/builderStore.test.js
import { setActivePinia, createPinia } from 'pinia'
import { expect, test, beforeEach } from 'vitest'
import { useBuilderStore } from '../src/stores/builder'
import { useCatalogStore } from '../src/stores/catalog'

beforeEach(() => { setActivePinia(createPinia()) })

test('builder toggles selection', () => {
  const builder = useBuilderStore()
  builder.selectItem('cpu', 1)
  expect(builder.build.cpu).toBe(1)
  
  builder.selectItem('cpu', 1) // toggle off
  expect(builder.build.cpu).toBeNull()
})
```

- [ ] **Step 2: Run test**
Expected FAIL.

- [ ] **Step 3: Implement store**

```javascript
// src/stores/builder.js
import { defineStore } from 'pinia'
import { useCatalogStore } from './catalog'

export const useBuilderStore = defineStore('builder', {
  state: () => ({
    build: { cpu: null, mobo: null, ram: null, gpu: null, storage: null, psu: null, case: null }
  }),
  getters: {
    totalPrice: (state) => {
      const catalogStore = useCatalogStore()
      let total = 0
      Object.entries(state.build).forEach(([cat, itemId]) => {
        if (itemId) {
          const item = catalogStore.hardwareList.find(i => i.id === itemId)
          if (item) total += item.price
        }
      })
      return total
    },
    hasAnyComponent: (state) => Object.values(state.build).some(val => val !== null),
    compatibilityIssues: (state) => {
      // Basic compatibility shim
      return []
    }
  },
  actions: {
    selectItem(catId, itemId) {
      if (this.build[catId] === itemId) {
        this.build[catId] = null
      } else {
        this.build[catId] = itemId
      }
    },
    clearBuild() {
      Object.keys(this.build).forEach(k => this.build[k] = null)
    }
  }
})
```

- [ ] **Step 4: Run test**
Expected PASS.

- [ ] **Step 5: Commit**

---

### Task 5: Refactor App.vue & Components

**Files:**
- Modify: `c:/Users/PC/Downloads/PCSpec/frontend/src/App.vue`
- Modify: `c:/Users/PC/Downloads/PCSpec/frontend/src/views/BuilderView.vue`
- Modify: `c:/Users/PC/Downloads/PCSpec/frontend/src/components/PriceSummary.vue`

**Interfaces:**
- Consumes: `useAuthStore`, `useCatalogStore`, `useBuilderStore`.

- [ ] **Step 1: Remove state from App.vue**
Remove all `build`, `catalog`, `compatibilityIssues`, and prop bindings to `<router-view>`. Leave routing and top-nav.

- [ ] **Step 2: Update BuilderView**
Remove props. Import `useCatalogStore`, `useBuilderStore` and pass necessary data to children.

- [ ] **Step 3: Check app runs**
Run `npm run dev` and ensure frontend works without errors.

- [ ] **Step 4: Commit**
```powershell
git commit -am "refactor: integrate pinia stores into components"
```
