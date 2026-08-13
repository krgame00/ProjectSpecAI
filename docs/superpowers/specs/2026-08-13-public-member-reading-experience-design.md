# Public and Member Reading Experience Design

**Date:** 2026-08-13
**Status:** Approved for implementation planning
**Selected direction:** Reading-first

## 1. Goal and Scope

Improve the remaining public and signed-in member surfaces across phone,
tablet, laptop, and desktop viewports while keeping the established PCSpec
identity consistent with the Builder.

This iteration covers:

1. Article listing (`/articles`)
2. Article detail (`/article/:id`)
3. Member profile (`/profile`)
4. Shared article loading, error, empty, image, and rich-content behavior

Admin is deliberately deferred to a separate iteration. This work also does
not add profile editing, change backend schemas, or alter article-authoring
workflows.

## 2. Design Direction

The approved Reading-first direction prioritizes legibility and a calm content
hierarchy over dense dashboards or highly decorative card layouts.

- Retain the system font, restrained Emerald accent, dark surfaces, hairline
  borders, and compact radii already used by the Builder.
- Use Emerald for actions, focus, and meaningful state rather than large
  decorative areas.
- Reduce one-off inline styles and page-specific visual rules in favor of the
  existing shared design vocabulary.
- Keep motion brief and functional. Respect `prefers-reduced-motion` and avoid
  whole-page translate animations that delay reading.
- Size layouts by readable content width and available space rather than by
  device names alone.

Verification anchors are 320 px and 390 px phones, 768 px tablets, 1024 px
compact desktop, and a standard desktop viewport.

## 3. Article Listing

### Structure

- Use a compact, left-aligned page introduction so the first article remains
  visible without excessive scrolling on a phone.
- Present the leading article as an editorial feature: image and copy side by
  side when space permits and stacked image-first on narrow screens.
- Place remaining articles in a flexible grid that naturally moves from one to
  multiple columns without relying on a minimum card width that can overflow.
- Keep title, date, excerpt, and reading action in a stable order on every
  viewport.

### Interaction

- Each article destination is a semantic link rather than a click handler on a
  generic container.
- The complete card may remain clickable, but it must expose one clear link,
  work with Enter, show `focus-visible`, and avoid nested competing actions.
- Hover effects are enhancements only; touch and keyboard users receive the
  same information and access.
- Long Thai or English titles and excerpts wrap without widening the page.

### Content States

- Loading uses placeholders shaped like the feature and article cards to
  minimize layout shift.
- Fetch failure displays a concise explanation and a Retry action.
- A successful response with no articles displays a true empty state, distinct
  from loading or failure.
- Missing or broken cover images use an intentional stable fallback rather
  than disappearing and collapsing the layout.

## 4. Article Detail

### Reading Layout

- Shorten the hero on phones; avoid fixed viewport-height presentation and a
  large minimum height that pushes the article below the fold.
- Place Back to articles in the normal reading flow instead of absolutely over
  the hero image.
- Constrain the article body to a comfortable reading measure while allowing
  the hero and intentional media to use wider space.
- Preserve a clear sequence of cover, metadata, title, and content.
- Style supported headings, paragraphs, lists, quotes, links, images, tables,
  preformatted text, and code consistently.

### Responsive Rich Content

- Images scale to their container and retain aspect ratio.
- Wide tables are contained in an intentional horizontal scrolling region;
  they must not create page-level overflow.
- Long links, code, and hardware identifiers wrap or scroll within their own
  content region.
- External links remain visually identifiable and keyboard accessible.

### Content Safety

Article content may retain useful rich formatting, but it must be sanitized
before insertion into the DOM. Sanitization uses an explicit allowlist of the
elements and attributes required by existing article content, removes event
handlers and unsafe URLs, and must not rely on CSS alone for safety.

Article-card excerpts are derived as safe plain text rather than inserted as
HTML. The implementation-planning step will first inspect existing packages
and backend guarantees, then select the smallest well-maintained sanitizer
approach; this design does not pre-authorize an unnecessary dependency.

### Routing and States

- Loading, request failure, and article not found are separate states.
- Failure offers Retry; not found offers a route back to the article list.
- Remove global Escape-to-back behavior. This page is a route, not a modal, so
  browser navigation and the visible Back link remain the predictable controls.

## 5. Member Profile

### Structure

- Use a compact identity header followed by a readable account-information
  section.
- Represent label/value information semantically as a description list.
- Keep labels and values aligned on wider screens and stack them on narrow
  screens so email addresses and long values do not overflow.
- Separate the destructive Sign out action from passive account information.
- Maintain a restrained view-only profile; editing is outside this iteration.

### Authentication and Failure Behavior

- Use the existing authentication store as the source of truth for token,
  member identity, and sign-out behavior.
- Avoid page-specific local-storage mutation, full-page reloads, and delayed
  redirects.
- An unauthorized response ends the invalid session through the shared logout
  flow and routes the user predictably.
- A recoverable network or server failure keeps the profile page in place,
  explains the failure, and offers Retry.
- Loading preserves the final layout footprint instead of showing an isolated
  text message.

## 6. State and Data Flow

The article store exposes explicit loading and error state in addition to its
article collection. Public views consume those states rather than inferring
them from an empty array.

- A retry initiates one new request and clears stale request errors.
- Empty means a completed successful response containing no articles.
- Article and catalog startup work should not be serialized when there is no
  dependency between the requests.
- Existing routes and API contracts remain unchanged.
- Date presentation is consistent across list and detail views and remains
  readable in Thai locale.

Profile data stays coordinated with the authentication store. The profile view
may fetch additional member details, but it must not establish a second
independent authentication model.

## 7. Accessibility and Responsive Requirements

- No page-level horizontal scrolling at supported widths.
- Interactive targets are at least 44 by 44 CSS pixels on coarse-pointer
  devices where practical, with adequate spacing between adjacent actions.
- Links, buttons, retry actions, and sign out expose visible keyboard focus.
- Heading order describes the page without depending on visual size alone.
- Loading status and actionable errors are available to assistive technology
  without repeatedly interrupting the user.
- Color is not the only signal for status or interaction.
- Layout remains usable with long localized copy, 200% text zoom, reduced
  motion, touch, pointer, and keyboard input.

## 8. Verification Strategy

Add focused component and browser coverage without coupling tests to incidental
pixel values.

Component tests cover:

1. Semantic article links and keyboard reachability
2. Loading, error with Retry, empty, and populated article-list states
3. Article-detail loading, failure, not-found, and populated states
4. Safe rich-content rendering and plain-text excerpts, including unsafe
   markup and URLs
5. Profile loading, retryable failure, unauthorized session handling, and
   shared logout behavior
6. Missing and broken image fallbacks

Responsive browser tests cover 320 px, 390 px, 768 px, 1024 px, and desktop
anchors, with emphasis on:

- No page-level horizontal overflow
- Feature and grid reflow
- Long titles, email addresses, links, images, tables, and code
- Keyboard traversal and visible focus
- Retry and not-found recovery paths
- Reduced-motion behavior

Existing frontend tests and the production build must continue to pass.
Browser screenshots supplement automated assertions at representative phone,
tablet, and desktop widths.

## 9. Acceptance Criteria

- Articles, Article Detail, and Profile are fully usable at 320 px through
  desktop widths without clipped required content or page-level overflow.
- All article destinations and recovery actions work by touch, mouse, and
  keyboard.
- Loading, failure, empty, and not-found states are visually and behaviorally
  distinct.
- Rich article formatting remains readable while unsafe markup and unsafe URLs
  are not rendered as executable content.
- Profile authentication and logout behavior use the shared store and do not
  force a full-page reload.
- The refreshed surfaces feel consistent with the Builder's restrained
  Emerald hierarchy without rebranding PCSpec.
- Added focused tests, existing frontend tests, and the production build pass.

## 10. Out of Scope

- Admin pages and article-authoring UI
- Profile editing, avatar upload, password change, or account deletion
- Backend schema or API contract changes
- A new typography, icon, or color system
- Comments, reactions, bookmarks, article search, filters, or pagination
- Replacing Vue, Pinia, Vue Router, or the existing application shell
