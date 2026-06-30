---
target: frontend/src/App.vue
total_score: 27
p0_count: 0
p1_count: 1
timestamp: 2026-06-28T09-55-58Z
slug: frontend-src-app-vue
---
#### Design Health Score
> *Consult the Heuristics Scoring Guide section below.*

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Good use of loaders, but lacks granular progress. |
| 2 | Match System / Real World | 3 | Clear hardware terms. |
| 3 | User Control and Freedom | 3 | Users can easily switch views. |
| 4 | Consistency and Standards | 2 | Rampant use of inline styles breaks the token system. |
| 5 | Error Prevention | 3 | Good use of compatibility checks. |
| 6 | Recognition Rather Than Recall | 3 | Summary sidebar keeps selections visible. |
| 7 | Flexibility and Efficiency | 3 | |
| 8 | Aesthetic and Minimalist Design | 2 | Navigation bar is cluttered; bounce animations feel tacky. |
| 9 | Error Recovery | 2 | |
| 10 | Help and Documentation | 3 | AI Chatbot serves as inline help. |
| **Total** | | **27/40** | **Average** |

#### Anti-Patterns Verdict

**LLM assessment**: The layout structure is fundamentally solid, but the execution suffers from "AI slop" tells: rampant inline styles (`style="padding: 0.4rem 0.8rem..."`) bypassing the CSS classes, and a cluttered navbar. The auth modal's "Quick Login" demo section is visual noise that undermines a premium feel.

**Deterministic scan**: The CLI detector found 3 issues:
- `bounce-easing`: `cubic-bezier(0.34, 1.56, 0.64, 1)` at line 570. Bounce animations feel dated and contradict the "technical precision" of the Cyber Forge aesthetic.
- `design-system-color`: Hardcoded `rgba(0,0,0,0.8)` at line 556 and `rgba(0,0,0,0.5)` at line 573, which drift from the established `DESIGN.md` dark/glass tokens.

**Visual overlays**: Skipped (Browser automation / mutable script injection unavailable in this environment).

#### Overall Impression
The application has a robust architectural foundation with clear component separation, but the visual execution is undermined by inconsistent styling and cartoonish motion curves. The biggest opportunity is standardizing the CSS and refining the animation.

#### What's Working
- **Component Architecture**: Excellent separation of concerns (`PriceSummary`, `HardwareSelection`, `ChatbotWindow`).
- **Contextual Awareness**: The sidebar keeps the user's current build context constantly visible.

#### Priority Issues
- **[P1] Inconsistent Styling (Inline Styles)**:
  - **Why it matters**: Mixing inline styles with classes makes the UI impossible to maintain and visually inconsistent.
  - **Fix**: Move all inline `padding`, `font-size`, and layout rules into the `.btn` and `.nav-content` classes in CSS.
  - **Suggested command**: `$impeccable polish frontend/src/App.vue`
- **[P2] Dated Motion Curves (Bounce Easing)**:
  - **Why it matters**: Elastic/bounce easing breaks the premium "Cyber Forge" aesthetic, making the UI feel like a toy rather than a precision tool.
  - **Fix**: Replace `cubic-bezier(0.34, 1.56, 0.64, 1)` with an exponential ease-out curve like `cubic-bezier(0.16, 1, 0.3, 1)`.
  - **Suggested command**: `$impeccable animate frontend/src/App.vue`
- **[P2] Color Token Drift**:
  - **Why it matters**: Hardcoded `rgba(0,0,0,x)` values create muddy shadows and backgrounds that don't match the design system.
  - **Fix**: Use the established `--glass-bg` or `--bg` variables.
  - **Suggested command**: `$impeccable colorize frontend/src/App.vue`

#### Persona Red Flags

**Jordan (First-Timer)**: The top navigation is very busy. A first-timer might be overwhelmed by the prominent "บทความ" (Articles), "เข้าสู่ระบบ" (Login), and demo login buttons competing for attention with the main "จัดสเปค" (Build PC) action.

**Alex (Power User)**: The "Quick Login" section in the auth modal feels unprofessional. A power user expects a clean, secure authentication flow.

#### Minor Observations
- The glassmorphic loader uses text-shadow glowing, which might be overkill when placed on a blurry background.
- Ensure the `ChatbotWindow` doesn't overlap critical elements on smaller screens.

#### Questions to Consider
- Does the navbar need all those buttons visible at once, or could secondary actions be grouped?
- What would a confident, minimal auth modal look like without the "Demo" scaffolding?
