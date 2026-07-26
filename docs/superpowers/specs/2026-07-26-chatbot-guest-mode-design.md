# Chatbot Guest Mode Design

Date: 2026-07-26

## Goal

Keep the SpecAI floating action button visible on the builder page for every visitor. Guests may open the existing chatbot window, but they cannot send messages or access chatbot history until they authenticate.

## User Experience

- `ChatbotWindow` is always rendered on `BuilderView`.
- Clicking the floating chatbot button continues to use the existing open/close state.
- For a guest, the open window shows a focused access-required state:
  - message: `กรุณาเข้าสู่ระบบก่อน เพื่อใช้งานผู้ช่วย SpecAI`
  - primary action: `เข้าสู่ระบบ`
- The guest state does not render chat history, typing indicators, the image attachment control, or the message input.
- Clicking the login action opens the application's existing login modal on its login tab. It does not introduce a second authentication UI.
- If login succeeds while the chatbot window remains open, the component reacts to authentication state and shows the normal member chatbot immediately.
- Authenticated chatbot behavior and styling remain unchanged.

## Component Design

### `ChatbotWindow.vue`

Add an `isAuthenticated` Boolean prop and a `request-login` event.

The floating button and header remain shared by both modes. The body and footer branch on `isAuthenticated`:

- authenticated: render the existing history, typing state, sources, build action, image preview, and input
- guest: render one dedicated login-required panel and its login button

The guest login button emits `request-login`. The component does not import the auth store or control the application modal directly, keeping it reusable and presentational.

### `BuilderView.vue`

Remove the current `v-if="authStore.isAuthenticated"` from `ChatbotWindow` so the floating button is always present.

Pass `:isAuthenticated="authStore.isAuthenticated"` and forward `request-login` upward. Existing chatbot events remain unchanged.

### `App.vue`

Listen for the routed view's `request-login` event. Set `authTab` to `login` and open the existing `showLoginModal`.

This preserves one owner for authentication UI and ensures the CTA always enters the login flow rather than whichever tab was last selected.

## Security and Data Flow

Guest mode changes presentation only. It does not weaken the existing server boundary:

1. Guests cannot access the message input through the rendered UI.
2. The chatbot store still refuses requests without a token.
3. All backend chatbot routes still require a valid JWT.

No guest request is sent to the chatbot API when opening the window or clicking the login action.

## Tests

- `ChatbotWindow` guest test:
  - floating button remains available
  - opening guest content shows the login-required message and CTA
  - history and input controls are absent
  - CTA emits `request-login`
- `ChatbotWindow` member regression test:
  - authenticated mode still renders history and input
- `BuilderView` integration test:
  - guest still renders the chatbot component
  - authentication state is passed reactively
  - login request is forwarded
- `App` integration test:
  - forwarded request opens the existing modal on the login tab

Run the focused component tests, the complete frontend suite, and the production build.

## Non-Goals

- No backend changes.
- No new login page or authentication modal.
- No guest chatbot API access.
- No changes to quota, session ownership, safe rendering, or SSE behavior.
