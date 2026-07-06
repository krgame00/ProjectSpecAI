---
target: BuilderView.vue
total_score: 39
p0_count: 0
p1_count: 0
timestamp: 2026-07-06T16-36-56Z
slug: frontend-src-views-builderview-vue
---
## Design Health Score
| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | Excellent data loading state with custom spinner |
| 2 | Match System / Real World | 4 | Clear category tooltips ("สมองของระบบ", "ตัวจ่ายไฟ") |
| 3 | User Control and Freedom | 4 | Tab-based selection allows easy category switching |
| 4 | Consistency and Standards | 3 | Same inline styles anti-pattern as AdminView |
| 5 | Error Prevention | 4 | Highlights compatibility issues and enforces logic |
| 6 | Recognition Rather Than Recall | 4 | N/A |
| 7 | Flexibility and Efficiency | 4 | N/A |
| 8 | Aesthetic and Minimalist Design | 4 | Clean layout, uses global structural classes well |
| 9 | Error Recovery | 4 | N/A |
| 10 | Help and Documentation | 4 | Floating Chatbot integration provides contextual help |
| **Total** | | **39/40** | **Excellent** |

## Anti-Patterns Verdict
**LLM assessment**: The `BuilderView.vue` acts as the primary layout coordinator for the PC builder. It beautifully implements system status visibility with a loader state while fetching from MySQL. The category tooltips are excellent for guiding non-expert users (Jordan persona). 
However, just like `AdminView.vue`, it suffers from the "Inline Styles" anti-pattern in the loader container (`style="background: var(--canvas); border: 1px solid var(--hairline); ..."`). This makes the template verbose.

**Deterministic scan**: The detector found 0 issues. Token usage is completely standard and adheres to the design system.

## Overall Impression
This is a highly functional and well-architected layout wrapper. It delegates complex logic to `PriceSummary` and `HardwareSelection` while maintaining the global state. The UX flow is very strong, especially with the inclusion of the floating AI Chatbot.

## What's Working
- **State Management Feedback**: The explicit `isLoading` check with a spinner ensures users know the app is doing work.
- **Copywriting**: The `categories` array contains brilliant, beginner-friendly tooltips (e.g., explaining that CPU is the "brain", PSU needs to handle total wattage). This perfectly caters to our first-timer persona.

## Priority Issues
- **[P3] Inline Styles**: The loader `<div>` uses excessive inline CSS.
  - *Fix*: Move the loader styles into a `<style scoped>` block to clean up the template.
  - *Suggested command*: `/impeccable polish`

## Persona Red Flags
**None**.
- **Jordan (First-Timer)** is actively supported by the tooltip definitions in the categories array.
- **Riley (Expert)** appreciates the clean split between sidebar summary and main selection area.

## Questions to Consider
- Do we want to quickly refactor the inline styles into a scoped style block?
- (Note: I see the Chatbot is included here, which aligns with our next task to debug it!).
