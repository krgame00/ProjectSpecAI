---
target: LandingView.vue
total_score: 29
p0_count: 0
p1_count: 1
timestamp: 2026-07-06T16-14-03Z
slug: frontend-src-views-landingview-vue
---
## Design Health Score
| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | N/A |
| 2 | Match System / Real World | 3 | Good copy |
| 3 | User Control and Freedom | 3 | N/A |
| 4 | Consistency and Standards | 3 | Undocumented colors and border radiuses |
| 5 | Error Prevention | 3 | N/A |
| 6 | Recognition Rather Than Recall | 3 | N/A |
| 7 | Flexibility and Efficiency | 3 | N/A |
| 8 | Aesthetic and Minimalist Design | 2 | Generic SaaS mockup window with empty gray boxes |
| 9 | Error Recovery | 3 | N/A |
| 10 | Help and Documentation | 3 | N/A |
| **Total** | | **29/40** | **Good** |

## Anti-Patterns Verdict
**LLM assessment**: The biggest 'AI Slop' tell here is the fake MacOS window (`mockup-window`) filled with empty gray boxes. This is a very common placeholder pattern that provides zero value to the user and makes the site look like a generic SaaS template rather than a PC builder tool. The pulsing effect on the primary button can also feel a bit cheap if it's too aggressive.

**Deterministic scan**: The detector found 5 issues:
- 4 instances of undocumented colors (`#1a2a22` for the gradient, and the 3 MacOS dot colors `#ff5f56`, `#ffbd2e`, `#27c93f`).
- 1 instance of a non-standard border radius (`99px` on the badge instead of a design token).

## Overall Impression
The dark theme and radial gradient set a nice, premium tone. However, the placeholder graphics (the empty mockup window) actively detract from the 'Expert Confidence' design principle. The interface needs to show real hardware or a real builder state.

## What's Working
- **Typography & Hierarchy**: The hero text is large, legible, and clear.
- **Dark Mode Integration**: The deep background colors create a premium feel.

## Priority Issues
- **[P1] Fake SaaS Mockup Window**: The hero features a fake browser window with empty gray boxes. It provides no context about PC building.
  - *Fix*: Replace the empty boxes with actual representations of PC hardware components, or replace the entire mockup with an image of the actual builder interface.
  - *Suggested command*: `/impeccable shape` or `/impeccable bolder`
- **[P2] Undocumented Colors**: The MacOS window dots use hardcoded hex colors that aren't in the design system, and the gradient uses an undocumented `#1a2a22`.
  - *Fix*: If keeping the window, map dots to `--danger`, `--warning`, `--success`. If keeping the dark green gradient, add it to tokens.
  - *Suggested command*: `/impeccable polish`
- **[P3] Non-standard Badge Radius**: The 'New' badge uses `99px` radius.
  - *Fix*: Change it to `var(--radius-pill)` or similar token to maintain system consistency.
  - *Suggested command*: `/impeccable polish`

## Persona Red Flags
**Jordan (First-Timer)**: Looks at the empty gray boxes in the mockup window and still has no idea what the 'PC Builder' actually looks like. Might assume the product is unfinished.
**Casey (Distracted Mobile User)**: On mobile, the mockup window just squishes the empty boxes into 2 columns, taking up valuable screen real estate with no information.

## Minor Observations
- The pulsing animation on the main CTA (`pulse-effect`) might be a bit too aggressive; standard hover/active states usually suffice for a 'clinical/expert' tone.

## Questions to Consider
- Does this product really need a fake OS window in the hero, or would a screenshot of the actual UI be more convincing?
