# Chatbot Security Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ให้เฉพาะสมาชิกที่ล็อกอินใช้ chatbot ได้ พร้อมปิด XSS, ผูก session กับเจ้าของ, ตรวจ payload และจำกัด AI quota ต่อผู้ใช้

**Architecture:** แยก backend security middleware และ session store ออกจาก Gemini route เพื่อให้ทดสอบโดยไม่เรียก provider ฝั่ง frontend แยก safe-rendering utility ออกจาก Vue component และให้ Pinia store รับผิดชอบ JWT, 401 logout และ unknown-session retry

**Tech Stack:** Node.js 20+, Express 5, Jest 30, Vue 3, Pinia 3, Vitest 4

## Global Constraints

- ทุก `/api/v1/chatbot/*` endpoint ต้องใช้ JWT authentication
- จำกัด 40 AI requests ต่อ user ID ต่อ 15 นาที; `/clear` ไม่นับ quota
- ข้อความยาวไม่เกิน 4,000 ตัวอักษร
- รูป decoded ไม่เกิน 8 MiB และรองรับเฉพาะ JPEG, PNG, WebP ที่ magic bytes ตรงกับ MIME
- Session มีอายุ 24 ชั่วโมง, server เป็นผู้สร้าง ID และ user อื่นอ่านหรือล้างไม่ได้
- Raw HTML จาก user, AI และ grounding source ต้องไม่เข้าสู่ DOM
- รักษา SSE streaming, Gemini fallback, image analysis, grounding และ recommended build เดิม
- ห้ามรวมไฟล์แก้ค้างของผู้ใช้ใน commit

---

## File Map

- Create `node-backend/middleware/chatbotSecurity.js`: payload validation และ per-user in-memory quota
- Create `node-backend/services/chatbotSessions.js`: owned session lifecycle และ TTL
- Create `node-backend/tests/chatbotSecurity.test.js`: regression tests สำหรับ payload/quota
- Create `node-backend/tests/chatbotSessions.test.js`: regression tests สำหรับ ownership/expiry
- Create `node-backend/tests/chatbotRoutes.test.js`: route-level authentication gate
- Modify `node-backend/routes/chatbot.js`: compose auth/security/session layers เข้ากับ Gemini flow
- Create `frontend/src/utils/chatSecurity.js`: safe Markdown และ HTTPS source filtering
- Create `frontend/tests/chatSecurity.test.js`: XSS/URL regression tests
- Modify `frontend/src/components/ChatbotWindow.vue`: ใช้ safe renderer และ safe links
- Modify `frontend/src/stores/chatbot.js`: JWT headers, 401 logout, server-issued session และ one-time 404 retry
- Modify `frontend/tests/chatbotStore.test.js`: authenticated request/error/retry tests
- Modify `frontend/src/views/BuilderView.vue`: ซ่อน chatbot สำหรับ guest
- Create `frontend/tests/BuilderView.test.js`: login-only visibility regression

---

### Task 1: Backend Payload and Quota Security

**Files:**
- Create: `node-backend/middleware/chatbotSecurity.js`
- Create: `node-backend/tests/chatbotSecurity.test.js`

**Interfaces:**
- Produces: `validateChatbotPayload(req, res, next)`
- Produces: `createChatbotRateLimiter({ limit, windowMs, now })`
- Produces: `chatbotRateLimiter`
- Consumes: `req.user.id`, `req.body.text`, `req.body.message`, `req.body.image`

- [ ] **Step 1: Write failing validation tests**

```js
const {
  validateChatbotPayload,
  createChatbotRateLimiter
} = require('../middleware/chatbotSecurity');

function responseDouble() {
  return {
    statusCode: 200,
    body: null,
    headers: {},
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    set(name, value) { this.headers[name] = String(value); return this; }
  };
}

function pngBase64(bytes = 32) {
  const buffer = Buffer.alloc(bytes);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buffer);
  return buffer.toString('base64');
}

test('rejects text longer than 4000 characters', () => {
  const req = { body: { text: 'x'.repeat(4001) } };
  const res = responseDouble();
  const next = jest.fn();
  validateChatbotPayload(req, res, next);
  expect(res.statusCode).toBe(400);
  expect(next).not.toHaveBeenCalled();
});

test.each([
  ['image/gif', pngBase64()],
  ['image/png', 'not-base64%%%'],
  ['image/jpeg', pngBase64()]
])('rejects invalid image %s', (mimeType, data) => {
  const req = { body: { image: { mimeType, data } } };
  const res = responseDouble();
  validateChatbotPayload(req, res, jest.fn());
  expect(res.statusCode).toBe(400);
});

test('accepts PNG with matching signature', () => {
  const req = { body: { image: { mimeType: 'image/png', data: pngBase64() } } };
  const res = responseDouble();
  const next = jest.fn();
  validateChatbotPayload(req, res, next);
  expect(next).toHaveBeenCalledTimes(1);
});

test('rejects decoded images larger than 8 MiB', () => {
  const req = {
    body: {
      image: {
        mimeType: 'image/png',
        data: pngBase64((8 * 1024 * 1024) + 1)
      }
    }
  };
  const res = responseDouble();
  validateChatbotPayload(req, res, jest.fn());
  expect(res.statusCode).toBe(400);
});
```

- [ ] **Step 2: Run validation tests and verify RED**

Run:

```powershell
npm.cmd test -- --runInBand tests/chatbotSecurity.test.js
```

Expected: FAIL because `../middleware/chatbotSecurity` does not exist.

- [ ] **Step 3: Implement payload validation**

Implement constants and helpers in `chatbotSecurity.js`:

```js
const MAX_TEXT_LENGTH = 4000;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function hasMagicBytes(buffer, mimeType) {
  if (mimeType === 'image/jpeg') {
    return buffer.length >= 3 &&
      buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mimeType === 'image/png') {
    return buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  if (mimeType === 'image/webp') {
    return buffer.length >= 12 &&
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP';
  }
  return false;
}

function decodeStrictBase64(value) {
  if (typeof value !== 'string' || value.length === 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(value)) {
    return null;
  }
  const buffer = Buffer.from(value, 'base64');
  return buffer.toString('base64').replace(/=+$/, '') === value.replace(/=+$/, '') ? buffer : null;
}

function validateChatbotPayload(req, res, next) {
  const text = req.body?.text ?? req.body?.message;
  const image = req.body?.image;
  if (text !== undefined && typeof text !== 'string') {
    return res.status(400).json({ error: 'Message must be a string' });
  }
  if (typeof text === 'string' && text.trim().length > MAX_TEXT_LENGTH) {
    return res.status(400).json({ error: 'Message exceeds 4000 characters' });
  }
  if ((!text || !text.trim()) && !image) {
    return res.status(400).json({ error: 'Message or image is required' });
  }
  if (image) {
    if (typeof image !== 'object' || !ALLOWED_IMAGE_TYPES.has(image.mimeType)) {
      return res.status(400).json({ error: 'Unsupported image type' });
    }
    const bytes = decodeStrictBase64(image.data);
    if (!bytes || bytes.length > MAX_IMAGE_BYTES || !hasMagicBytes(bytes, image.mimeType)) {
      return res.status(400).json({ error: 'Invalid image data' });
    }
  }
  next();
}
```

- [ ] **Step 4: Add failing quota tests**

Append:

```js
test('limits the 41st request per user within 15 minutes', () => {
  let currentTime = 1_000;
  const limiter = createChatbotRateLimiter({
    limit: 40,
    windowMs: 15 * 60 * 1000,
    now: () => currentTime
  });
  const req = { user: { id: 7 } };
  for (let index = 0; index < 40; index += 1) {
    const res = responseDouble();
    const next = jest.fn();
    limiter(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  }
  const blocked = responseDouble();
  limiter(req, blocked, jest.fn());
  expect(blocked.statusCode).toBe(429);
  expect(blocked.headers['RateLimit-Limit']).toBe('40');
});

test('uses separate quota buckets for different users', () => {
  const limiter = createChatbotRateLimiter({ limit: 1, windowMs: 1000, now: () => 0 });
  const first = jest.fn();
  const second = jest.fn();
  limiter({ user: { id: 1 } }, responseDouble(), first);
  limiter({ user: { id: 2 } }, responseDouble(), second);
  expect(first).toHaveBeenCalled();
  expect(second).toHaveBeenCalled();
});
```

- [ ] **Step 5: Run quota tests and verify RED**

Run the same targeted Jest command. Expected: FAIL because `createChatbotRateLimiter` is missing.

- [ ] **Step 6: Implement per-user limiter**

Implement a closure-backed `Map` keyed by `String(req.user.id)`. Reset a bucket when `now() >= resetAt`; set `RateLimit-Limit`, `RateLimit-Remaining`, and `RateLimit-Reset`; return `429` after 40 accepted requests. Export a singleton configured with `limit: 40` and `windowMs: 900000`.

- [ ] **Step 7: Verify GREEN and commit**

Run:

```powershell
npm.cmd test -- --runInBand tests/chatbotSecurity.test.js
```

Expected: all chatbot security tests PASS.

Commit only:

```powershell
git add node-backend/middleware/chatbotSecurity.js node-backend/tests/chatbotSecurity.test.js
git commit -m "fix(chatbot): validate payloads and quota"
```

---

### Task 2: Owned Session Store

**Files:**
- Create: `node-backend/services/chatbotSessions.js`
- Create: `node-backend/tests/chatbotSessions.test.js`

**Interfaces:**
- Produces: `createChatbotSessionStore({ ttlMs, now, randomUUID })`
- Produces singleton: `chatbotSessions`
- Produces methods: `resolve(ownerId, sessionId)`, `clear(ownerId, sessionId)`
- `resolve` returns `{ id, history }`; throws error with `code === 'SESSION_NOT_FOUND'` for unknown, expired, or foreign IDs

- [ ] **Step 1: Write failing ownership and expiry tests**

```js
const { createChatbotSessionStore } = require('../services/chatbotSessions');

test('server creates a session when id is omitted', () => {
  const store = createChatbotSessionStore({
    ttlMs: 1000,
    now: () => 0,
    randomUUID: () => 'server-id'
  });
  expect(store.resolve(10)).toEqual({ id: 'server-id', history: [] });
});

test('foreign owner cannot resolve or clear a session', () => {
  const store = createChatbotSessionStore({
    ttlMs: 1000,
    now: () => 0,
    randomUUID: () => 'private-id'
  });
  store.resolve(10);
  expect(() => store.resolve(11, 'private-id')).toThrow(
    expect.objectContaining({ code: 'SESSION_NOT_FOUND' })
  );
  expect(() => store.clear(11, 'private-id')).toThrow(
    expect.objectContaining({ code: 'SESSION_NOT_FOUND' })
  );
});

test('expired session cannot be resolved', () => {
  let time = 0;
  const store = createChatbotSessionStore({
    ttlMs: 1000,
    now: () => time,
    randomUUID: () => 'expiring-id'
  });
  store.resolve(10);
  time = 1001;
  expect(() => store.resolve(10, 'expiring-id')).toThrow(
    expect.objectContaining({ code: 'SESSION_NOT_FOUND' })
  );
});
```

- [ ] **Step 2: Run session tests and verify RED**

Run:

```powershell
npm.cmd test -- --runInBand tests/chatbotSessions.test.js
```

Expected: FAIL because the service does not exist.

- [ ] **Step 3: Implement the session factory and singleton**

Use a private `Map`. Store `{ ownerId: String(ownerId), history: [], lastAccessedAt }`. On every `resolve`/`clear`, remove expired entries. Create IDs only when `sessionId` is absent. Unknown, expired, and foreign IDs must all throw the same `SESSION_NOT_FOUND` error. Export a singleton with 24-hour TTL and `crypto.randomUUID`.

- [ ] **Step 4: Verify GREEN and commit**

Run targeted session tests. Expected: PASS.

Commit only:

```powershell
git add node-backend/services/chatbotSessions.js node-backend/tests/chatbotSessions.test.js
git commit -m "fix(chatbot): enforce session ownership"
```

---

### Task 3: Secure Chatbot Routes

**Files:**
- Modify: `node-backend/routes/chatbot.js`
- Create: `node-backend/tests/chatbotRoutes.test.js`

**Interfaces:**
- Consumes: `authMiddleware`
- Consumes: `chatbotRateLimiter`, `validateChatbotPayload`
- Consumes: `chatbotSessions.resolve(ownerId, sessionId)` and `.clear(ownerId, sessionId)`
- Preserves existing SSE event names and Gemini behavior

- [ ] **Step 1: Write failing route authentication tests**

Create a small Express server inside the test and use native `fetch`:

```js
process.env.JWT_SECRET = 'chatbot-route-test-secret';
delete process.env.GEMINI_API_KEY;

const express = require('express');
const chatbotRoutes = require('../routes/chatbot');

let server;
let baseUrl;

beforeAll(async () => {
  const app = express();
  app.use(express.json({ limit: '20mb' }));
  app.use('/chatbot', chatbotRoutes);
  await new Promise(resolve => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

afterAll(async () => {
  await new Promise(resolve => server.close(resolve));
});

test.each([
  ['/chatbot/message', { message: 'hello' }],
  ['/chatbot/stream', { text: 'hello' }],
  ['/chatbot/clear', {}]
])('%s requires authentication', async (path, body) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  expect(response.status).toBe(401);
});
```

- [ ] **Step 2: Run route tests and verify RED**

Run:

```powershell
npm.cmd test -- --runInBand tests/chatbotRoutes.test.js
```

Expected: at least `/clear` returns `200` and other routes do not return `401`.

- [ ] **Step 3: Compose middleware into each route**

Import:

```js
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  chatbotRateLimiter,
  validateChatbotPayload
} = require('../middleware/chatbotSecurity');
const { chatbotSessions } = require('../services/chatbotSessions');
```

Change route signatures:

```js
router.post('/message', authMiddleware, chatbotRateLimiter, validateChatbotPayload, async (req, res, next) => {
router.post('/stream', authMiddleware, chatbotRateLimiter, validateChatbotPayload, async (req, res, next) => {
router.post('/clear', authMiddleware, (req, res, next) => {
```

Remove the module-level `sessions` Map and `getHistory`. In `/stream`, resolve before starting SSE:

```js
let session;
try {
  session = chatbotSessions.resolve(req.user.id, sessionId);
} catch (error) {
  if (error.code === 'SESSION_NOT_FOUND') {
    return res.status(404).json({ error: 'Chat session not found' });
  }
  throw error;
}
const sid = session.id;
const history = session.history;
```

In `/clear`, call `chatbotSessions.clear(req.user.id, sessionId)` and map `SESSION_NOT_FOUND` to the same `404` response.

- [ ] **Step 4: Add authenticated invalid-payload test**

Sign a token with `jsonwebtoken.sign({ id: 9, role: 'customer' }, process.env.JWT_SECRET)` and assert authenticated `/stream` with 4,001 characters returns `400`. This proves validation runs before Gemini.

- [ ] **Step 5: Prove `/clear` does not consume AI quota**

Send 41 authenticated `/clear` requests with an unknown session ID. Assert every response remains `404` and the 41st response is not `429`. This catches accidental placement of `chatbotRateLimiter` on the clear route.

- [ ] **Step 6: Run backend suites and commit**

Run:

```powershell
npm.cmd test -- --runInBand
```

Expected: all backend suites PASS. The existing virtualenv collision warning may remain; no chatbot test may contact Gemini.

Commit only:

```powershell
git add node-backend/routes/chatbot.js node-backend/tests/chatbotRoutes.test.js
git commit -m "fix(chatbot): protect AI routes"
```

---

### Task 4: Safe Frontend Rendering

**Files:**
- Create: `frontend/src/utils/chatSecurity.js`
- Create: `frontend/tests/chatSecurity.test.js`
- Modify: `frontend/src/components/ChatbotWindow.vue`

**Interfaces:**
- Produces: `renderSafeMarkdown(text): string`
- Produces: `toSafeHttpsUrl(value): string | null`
- Produces: `sanitizeSources(sources): Array<{ uri, title }>`

- [ ] **Step 1: Write failing safe-rendering tests**

```js
import { describe, expect, test } from 'vitest'
import {
  renderSafeMarkdown,
  toSafeHttpsUrl,
  sanitizeSources
} from '../src/utils/chatSecurity'

describe('chat security rendering', () => {
  test('escapes raw HTML before rendering markdown', () => {
    const output = renderSafeMarkdown('<img src=x onerror="alert(1)"> **safe**')
    expect(output).not.toContain('<img')
    expect(output).toContain('&lt;img')
    expect(output).toContain('onerror=&quot;alert(1)&quot;')
    expect(output).toContain('<strong>safe</strong>')
  })

  test.each(['javascript:alert(1)', 'http://example.com', 'data:text/html,x'])(
    'rejects unsafe source URL %s',
    value => expect(toSafeHttpsUrl(value)).toBeNull()
  )

  test('keeps only HTTPS sources', () => {
    expect(sanitizeSources([
      { uri: 'https://example.com/a', title: 'A' },
      { uri: 'javascript:alert(1)', title: 'Bad' }
    ])).toEqual([{ uri: 'https://example.com/a', title: 'A' }])
  })
})
```

- [ ] **Step 2: Run frontend test and verify RED**

Run:

```powershell
npm.cmd test -- tests/chatSecurity.test.js
```

Expected: FAIL because `chatSecurity.js` does not exist.

- [ ] **Step 3: Implement safe rendering utilities**

Escape `&`, `<`, `>`, `"`, `'` in that order, then apply non-greedy bold/italic replacements and newline-to-`<br>`. Parse URLs with `new URL(value)` and accept only `url.protocol === 'https:'`. `sanitizeSources` must discard invalid records and coerce title to a string.

- [ ] **Step 4: Wire utilities into ChatbotWindow**

Replace local `renderMarkdown` with imported `renderSafeMarkdown`. Render `sanitizeSources(msg.sources)` in the loop, bind its sanitized `uri`, and add:

```html
target="_blank"
rel="noopener noreferrer"
```

Delete the old raw `renderMarkdown` function.

- [ ] **Step 5: Verify GREEN and commit**

Run:

```powershell
npm.cmd test -- tests/chatSecurity.test.js tests/HardwareSelection.test.js
```

Expected: PASS.

Commit only:

```powershell
git add frontend/src/utils/chatSecurity.js frontend/tests/chatSecurity.test.js frontend/src/components/ChatbotWindow.vue
git commit -m "fix(chatbot): render untrusted text safely"
```

---

### Task 5: Authenticated Client, Retry, and Guest UI

**Files:**
- Modify: `frontend/src/stores/chatbot.js`
- Modify: `frontend/tests/chatbotStore.test.js`
- Modify: `frontend/src/views/BuilderView.vue`
- Create: `frontend/tests/BuilderView.test.js`

**Interfaces:**
- Consumes: `useAuthStore().token`, `.isAuthenticated`, `.logout()`
- Preserves: `sendMessage(payload)`, `processBotResponse(text, image)`
- Adds internal optional retry flag: `processBotResponse(text, image, retriedSession = false)`

- [ ] **Step 1: Add failing JWT and 401 tests**

Extend the test localStorage mock and create a minimal fetch response double:

```js
test('sends JWT with chatbot request', async () => {
  localStorage.setItem('token', 'member-token')
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status: 429,
    json: async () => ({ error: 'Chatbot rate limit exceeded' })
  })
  const chat = useChatbotStore()
  await chat.processBotResponse('hello')
  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('/chatbot/stream'),
    expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: 'Bearer member-token'
      })
    })
  )
})

test('logs out when chatbot token is rejected', async () => {
  const auth = useAuthStore()
  auth.setUser({ id: 1 }, 'expired-token')
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status: 401,
    json: async () => ({ error: 'Token is not valid' })
  })
  await useChatbotStore().processBotResponse('hello')
  expect(auth.isAuthenticated).toBe(false)
})
```

- [ ] **Step 2: Run store tests and verify RED**

Run:

```powershell
npm.cmd test -- tests/chatbotStore.test.js
```

Expected: JWT header assertion fails and auth remains logged in.

- [ ] **Step 3: Implement authenticated requests**

Import `useAuthStore`. Do not generate UUID in the browser. Read an existing `chatbot_session_id` only. Before fetch, require `authStore.token`; otherwise append a login-required bot message and return. Send headers:

```js
{
  'Content-Type': 'application/json',
  Authorization: `Bearer ${authStore.token}`
}
```

For `401`, call `authStore.logout()`, remove `chatbot_session_id`, and append a login-expired message.

- [ ] **Step 4: Add failing one-time session retry test**

Mock fetch to return `404` once, then a valid SSE response whose reader emits:

```text
event: session
data: {"sessionId":"server-session"}

event: done
data: {}

```

Assert fetch runs twice, the second request body has no `sessionId`, and localStorage stores `server-session`.

- [ ] **Step 5: Implement bounded retry**

When response status is `404`, remove `chatbot_session_id`. If `retriedSession` is false, call `processBotResponse(text, image, true)` once; otherwise surface the error. Do not append a bot bubble before the retry succeeds.

- [ ] **Step 6: Add failing guest-visibility test**

Create `frontend/tests/BuilderView.test.js`:

```js
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import BuilderView from '../src/views/BuilderView.vue'
import { useAuthStore } from '../src/stores/auth'
import { useCatalogStore } from '../src/stores/catalog'

describe('BuilderView chatbot access', () => {
  let pinia

  beforeEach(() => {
    global.localStorage = {
      data: {},
      getItem(key) { return this.data[key] || null },
      setItem(key, value) { this.data[key] = value },
      removeItem(key) { delete this.data[key] }
    }
    pinia = createPinia()
    setActivePinia(pinia)
    useCatalogStore().hardwareList = { cpu: [] }
  })

  function mountBuilder() {
    return mount(BuilderView, {
      global: {
        plugins: [pinia],
        stubs: {
          PriceSummary: true,
          HardwareSelection: true,
          ChatbotWindow: { template: '<div data-test="chatbot-window" />' },
          PrintTemplate: true
        },
        mocks: { $router: { push: vi.fn() } }
      },
      props: { isChatOpen: false, chatHistory: [], isTyping: false }
    })
  }

  test('shows chatbot only to an authenticated member', async () => {
    const wrapper = mountBuilder()
    expect(wrapper.find('[data-test="chatbot-window"]').exists()).toBe(false)
    useAuthStore().setUser({ id: 1, role: 'customer' }, 'member-token')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-test="chatbot-window"]').exists()).toBe(true)
  })
})
```

- [ ] **Step 7: Hide chatbot for guests**

Import `useAuthStore` in `BuilderView.vue`, initialize `const authStore = useAuthStore()`, and add `v-if="authStore.isAuthenticated"` to `ChatbotWindow`.

- [ ] **Step 8: Verify frontend suites and commit**

Run:

```powershell
npm.cmd test
npm.cmd run build
```

Expected: all Vitest files PASS and Vite production build exits `0`.

Commit only:

```powershell
git add frontend/src/stores/chatbot.js frontend/tests/chatbotStore.test.js frontend/src/views/BuilderView.vue frontend/tests/BuilderView.test.js
git commit -m "fix(chatbot): require member sessions"
```

---

### Task 6: Full Security Verification

**Files:**
- Verify only; modify tests or implementation only if verification exposes a chatbot regression

**Interfaces:**
- End-to-end contract: authenticated client → validated request → owned session → SSE → safely rendered output

- [ ] **Step 1: Run focused backend security tests**

```powershell
npm.cmd test -- --runInBand tests/chatbotSecurity.test.js tests/chatbotSessions.test.js tests/chatbotRoutes.test.js
```

Expected: PASS with no Gemini network calls.

- [ ] **Step 2: Run complete backend suite**

```powershell
npm.cmd test -- --runInBand
```

Expected: all backend tests PASS. Record the existing virtualenv module-collision warning separately.

- [ ] **Step 3: Run focused frontend security tests**

```powershell
npm.cmd test -- tests/chatSecurity.test.js tests/chatbotStore.test.js tests/BuilderView.test.js
```

Expected: PASS.

- [ ] **Step 4: Run complete frontend suite and build**

```powershell
npm.cmd test
npm.cmd run build
```

Expected: all frontend tests PASS and production build exits `0`.

- [ ] **Step 5: Audit the final diff**

Run:

```powershell
git diff --check e3247c1..HEAD
git status --short
```

Confirm no credential, generated build, virtualenv, or unrelated user file was staged. Confirm existing user modifications in `HardwareSelection.vue`, `PriceSummary.vue`, and `router/index.js` remain untouched.
