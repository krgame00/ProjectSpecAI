# Chatbot Guest Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the SpecAI floating button visible to guests and show a login-required state that opens the existing login modal, without granting guest API access.

**Architecture:** `ChatbotWindow` gains a presentational `isAuthenticated` mode and emits `request-login`. `BuilderView` always renders it and forwards that event. `App` remains the sole owner of the authentication modal and opens the login tab when it receives the request.

**Tech Stack:** Vue 3 `<script setup>`, Pinia, Vue Test Utils, Vitest, Vite

## Global Constraints

- Guests must never see chat history, typing UI, image attachment, or message input.
- Opening guest mode and requesting login must not call the chatbot API.
- The existing JWT-protected backend and token guard in the chatbot store remain unchanged.
- The login CTA must reuse the existing modal and explicitly select its login tab.
- Authenticated chatbot rendering and events must remain unchanged.
- No new dependency is permitted.

---

### Task 1: Add Guest Presentation to ChatbotWindow

**Files:**
- Modify: `frontend/src/components/ChatbotWindow.vue`
- Create: `frontend/tests/ChatbotWindow.test.js`
- Modify: `frontend/tests/chatSecurity.test.js`

**Interfaces:**
- Consumes prop: `isAuthenticated: boolean`
- Produces event: `request-login`
- Preserves events: `toggle-chat`, `send-message`, `apply-build`

- [ ] **Step 1: Write failing guest and member component tests**

Create `frontend/tests/ChatbotWindow.test.js`:

```js
import { describe, expect, test } from 'vitest'
import { mount } from '@vue/test-utils'
import ChatbotWindow from '../src/components/ChatbotWindow.vue'

function mountChatbot(overrides = {}) {
  return mount(ChatbotWindow, {
    props: {
      isOpen: true,
      isAuthenticated: false,
      history: [{ role: 'bot', text: 'private history' }],
      isTyping: true,
      ...overrides
    }
  })
}

describe('ChatbotWindow guest mode', () => {
  test('shows a login-required panel without member chat controls', () => {
    const wrapper = mountChatbot()

    expect(wrapper.get('[data-test="guest-chat-access"]').text())
      .toContain('กรุณาเข้าสู่ระบบก่อน')
    expect(wrapper.find('[data-test="chat-login"]').exists()).toBe(true)
    expect(wrapper.find('.msg').exists()).toBe(false)
    expect(wrapper.find('.typing-indicator').exists()).toBe(false)
    expect(wrapper.find('.chat-input-container').exists()).toBe(false)
  })

  test('requests the existing login flow from the guest CTA', async () => {
    const wrapper = mountChatbot()

    await wrapper.get('[data-test="chat-login"]').trigger('click')

    expect(wrapper.emitted('request-login')).toHaveLength(1)
  })

  test('preserves normal history and input for authenticated members', () => {
    const wrapper = mountChatbot({
      isAuthenticated: true,
      isTyping: false
    })

    expect(wrapper.find('[data-test="guest-chat-access"]').exists()).toBe(false)
    expect(wrapper.get('.msg-content').text()).toContain('private history')
    expect(wrapper.find('.chat-input-container').exists()).toBe(true)
  })
})
```

- [ ] **Step 2: Run the component test and verify RED**

Run:

```powershell
npm.cmd test -- tests/ChatbotWindow.test.js
```

Expected: FAIL because the guest panel, CTA, prop behavior, and event do not exist.

- [ ] **Step 3: Implement the minimal guest/member branches**

In `ChatbotWindow.vue`, define the authentication prop and event:

```js
const props = defineProps({
  isOpen: Boolean,
  history: Array,
  isTyping: Boolean,
  isAuthenticated: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'toggle-chat',
  'send-message',
  'apply-build',
  'request-login'
])
```

Inside the shared chatbot wrapper, render the authenticated body and input only when `isAuthenticated`. Render this guest panel in the alternate branch:

```html
<div
  v-if="!isAuthenticated"
  class="guest-chat-access"
  data-test="guest-chat-access"
>
  <div class="guest-access-icon" aria-hidden="true">🔒</div>
  <h3>เข้าสู่ระบบเพื่อใช้งาน SpecAI</h3>
  <p>กรุณาเข้าสู่ระบบก่อน เพื่อใช้งานผู้ช่วย SpecAI</p>
  <button
    type="button"
    class="btn btn-primary guest-login-btn"
    data-test="chat-login"
    @click="$emit('request-login')"
  >
    เข้าสู่ระบบ
  </button>
</div>
```

Wrap the existing `.chat-body` and `.chat-input-container` in an authenticated branch without changing their internal behavior. Add scoped styles that center the guest panel within the existing window and preserve responsive sizing.

- [ ] **Step 4: Update existing safe-rendering mounts**

Every existing `ChatbotWindow` mount in `frontend/tests/chatSecurity.test.js` that asserts member history must pass:

```js
isAuthenticated: true
```

This makes the security tests explicit about which rendering mode they exercise.

- [ ] **Step 5: Verify GREEN and commit**

Run:

```powershell
npm.cmd test -- tests/ChatbotWindow.test.js tests/chatSecurity.test.js
```

Expected: both files PASS; guest tests observe no member controls and existing XSS tests remain green.

Commit only:

```powershell
git add frontend/src/components/ChatbotWindow.vue frontend/tests/ChatbotWindow.test.js frontend/tests/chatSecurity.test.js
git commit -m "feat(chatbot): add guest access state"
```

---

### Task 2: Wire Guest Login Request Through Builder and App

**Files:**
- Modify: `frontend/src/views/BuilderView.vue`
- Modify: `frontend/tests/BuilderView.test.js`
- Modify: `frontend/src/App.vue`
- Create: `frontend/tests/App.test.js`

**Interfaces:**
- Consumes: `ChatbotWindow` prop `isAuthenticated`
- Consumes: `ChatbotWindow` event `request-login`
- Produces routed-view event: `request-login`
- App handler: `openLoginModal(): void`

- [ ] **Step 1: Replace the old BuilderView expectation with failing guest wiring tests**

Update `frontend/tests/BuilderView.test.js` so its chatbot stub declares the new prop and emits:

```js
ChatbotWindow: {
  props: ['isAuthenticated'],
  emits: ['request-login'],
  template: `
    <div
      data-test="chatbot-window"
      :data-authenticated="String(isAuthenticated)"
    >
      <button
        data-test="stub-request-login"
        @click="$emit('request-login')"
      >
        login
      </button>
    </div>
  `
}
```

Replace the previous guest-hidden test with:

```js
test('keeps chatbot visible and passes reactive auth state', async () => {
  const wrapper = mountBuilder()

  expect(wrapper.find('[data-test="chatbot-window"]').exists()).toBe(true)
  expect(wrapper.get('[data-test="chatbot-window"]').attributes('data-authenticated'))
    .toBe('false')

  useAuthStore().setUser({ id: 7 }, 'member.jwt')
  await nextTick()

  expect(wrapper.get('[data-test="chatbot-window"]').attributes('data-authenticated'))
    .toBe('true')
})

test('forwards a guest login request to App', async () => {
  const wrapper = mountBuilder()

  await wrapper.get('[data-test="stub-request-login"]').trigger('click')

  expect(wrapper.emitted('request-login')).toHaveLength(1)
})
```

- [ ] **Step 2: Write the failing App modal integration test**

Create `frontend/tests/App.test.js`. Use a routed component stub that emits `request-login`, a `RouterView` stub that supplies it through the scoped slot, real Pinia stores with their initial fetch actions stubbed, and `$route`/`$router` mocks.

The core assertion must be:

```js
test('opens the existing login modal on the login tab', async () => {
  const wrapper = mountApp()

  await wrapper.get('[data-test="route-request-login"]').trigger('click')

  expect(wrapper.find('.modal-overlay').exists()).toBe(true)
  expect(wrapper.get('.auth-tab.active').text()).toContain('เข้าสู่ระบบ')
})
```

The routed stub must emit the event through the actual `<component>` listener:

```js
const RoutedViewStub = {
  emits: ['request-login'],
  template: `
    <button
      data-test="route-request-login"
      @click="$emit('request-login')"
    >
      login
    </button>
  `
}
```

Stub `catalogStore.fetchCatalog()` and `articleStore.fetchArticles()` before mounting so the test performs no network calls.

- [ ] **Step 3: Run wiring tests and verify RED**

Run:

```powershell
npm.cmd test -- tests/BuilderView.test.js tests/App.test.js
```

Expected: FAIL because BuilderView still removes the chatbot for guests, does not pass/forward the new interface, and App does not handle the routed event.

- [ ] **Step 4: Implement BuilderView wiring**

Always render `ChatbotWindow`, pass authentication state, and forward the event:

```html
<ChatbotWindow
  :isAuthenticated="authStore.isAuthenticated"
  :isOpen="isChatOpen"
  :history="chatHistory"
  :isTyping="isTyping"
  @toggle-chat="$emit('toggle-chat', $event)"
  @send-message="$emit('send-message', $event)"
  @apply-build="$emit('apply-build', $event)"
  @request-login="$emit('request-login')"
/>
```

Add `request-login` to `BuilderView`'s `defineEmits` list.

- [ ] **Step 5: Implement the App-owned login handler**

Forward the event from the routed component:

```html
@request-login="openLoginModal"
```

Add:

```js
const openLoginModal = () => {
  authTab.value = 'login'
  showLoginModal.value = true
}
```

Reuse this handler for the navigation login button where practical:

```html
@click="openLoginModal"
```

- [ ] **Step 6: Verify focused tests**

Run:

```powershell
npm.cmd test -- tests/ChatbotWindow.test.js tests/BuilderView.test.js tests/App.test.js tests/chatSecurity.test.js tests/chatbotStore.test.js
```

Expected: all guest/member, auth modal, rendering-security, and token-guard tests PASS.

- [ ] **Step 7: Verify the full frontend and production build**

Run:

```powershell
npm.cmd test
npm.cmd run build
git diff --check
```

Expected: all Vitest files PASS, Vite exits `0`, and the diff has no whitespace errors. The existing Node experimental localStorage warning may remain.

- [ ] **Step 8: Commit**

Commit only:

```powershell
git add frontend/src/views/BuilderView.vue frontend/tests/BuilderView.test.js frontend/src/App.vue frontend/tests/App.test.js
git commit -m "feat(chatbot): route guests to login"
```

