# Implementation Plan - Centralized Brand CI & Theme System

## Goal

Build a centralized branding system for the webapp so the product can be reused across multiple clients and rebranded with minimal code changes. The target outcome is that core brand identity such as colors, emphasis, surfaces, focus styles, and key visual accents can be updated in one place and reflected consistently across the application.

This plan is intentionally shaped around the current codebase, which already has partial tokenization in `elearning-webapp/src/index.css` but still contains many hardcoded Tailwind color utilities, custom gradients, and direct `rgba(...)` values inside components.

## Business Outcome

- Support client-specific branding without manually editing dozens of components.
- Reduce the cost and risk of customizing the product for each customer.
- Create a cleaner design system foundation for future features.
- Prepare the app for either build-time branding or runtime client theme switching.

## Current State Summary

### What already exists

- `elearning-webapp/src/index.css` already defines some global tokens:
  - `--color-primary`
  - `--color-primary-hover`
  - `--color-primary-light`
  - `--color-success`
  - `--color-warning`
  - `--color-danger`
  - `--color-background`
  - `--color-surface`
  - typography, radius, shadow, spacing tokens
- Shared component classes already use some of these tokens:
  - `.btn-primary`
  - `.form-input`
  - parts of `.card`

### What is still fragmented

- Many components still use hardcoded Tailwind color families such as `slate`, `amber`, `indigo`, `red`, `emerald`.
- Several high-visibility UI areas still use hardcoded gradients and alpha colors.
- Some CSS files outside `index.css` still embed direct colors and overlays.
- Some third-party integrations such as video player styling still use literal hex values.

## Refined Strategy

The right move is not to rebuild styling from scratch. We should evolve the current token setup into a semantic theme system and migrate the remaining hardcoded values in phases.

### Core principle

Move from color-name styling to semantic styling.

Instead of thinking:

- `indigo`
- `amber`
- `slate`

we should think:

- `brand-primary`
- `brand-accent`
- `text-main`
- `text-muted`
- `surface-base`
- `surface-elevated`
- `border-subtle`
- `status-success`
- `status-danger`

That way, if a client changes from Indigo/Amber to Green/Gold or Black/Red, the component logic stays untouched and only the theme definition changes.

## Architecture Decision

### Theme model

Use a two-layer token model:

1. Foundation tokens
   - Raw brand primitives such as hex values, rgb values, typography family, radius, shadow strength.
2. Semantic tokens
   - UI intent tokens consumed by components.

Example direction:

```css
@theme {
  /* Foundation */
  --brand-primary: #4338ca;
  --brand-primary-rgb: 67 56 202;
  --brand-accent: #f59e0b;
  --brand-accent-rgb: 245 158 11;

  /* Semantic */
  --color-action-primary: var(--brand-primary);
  --color-action-primary-hover: #3730a3;
  --color-highlight: var(--brand-accent);
  --color-text-main: #1e293b;
  --color-text-muted: #64748b;
  --color-surface-base: #f8fafc;
  --color-surface-card: #ffffff;
  --color-border-subtle: #e2e8f0;
}
```

### Why rgb tokens are required

For full rebranding support, hex-only variables are not enough. The app currently uses many translucent fills, shadows, focus rings, and glass effects. Those should be driven by rgb-based variables, for example:

```css
box-shadow: 0 0 0 3px rgb(var(--brand-primary-rgb) / 0.2);
background: rgb(var(--brand-primary-rgb) / 0.08);
```

Without this, changing only the main hex color will still leave old tints in overlays, gradients, glow effects, and cards.

## Scope

### In scope

- Centralize color and surface styling into semantic tokens.
- Normalize shared UI primitives to consume theme tokens.
- Replace hardcoded brand-like colors in high-impact user/admin screens.
- Document the branding contract for future development.
- Prepare the architecture for future runtime client themes.

### Out of scope for this phase

- Full white-labeling of logos, illustrations, or copy.
- Per-client asset management in backend storage.
- Full dark mode support.
- Automatic contrast generation for arbitrary client palettes.

## Detailed Plan

## Phase 1 - Define the Theme Contract

### Objective

Turn `elearning-webapp/src/index.css` into the single source of truth for brand styling.

### Files

- `elearning-webapp/src/index.css`

### Tasks

- Expand the existing `@theme` block into a structured token system.
- Keep the current tokens temporarily for backward compatibility where helpful.
- Add semantic aliases so we can migrate incrementally without breaking the app.
- Introduce paired rgb tokens for translucent styling.
- Normalize shared non-color tokens that are part of brand feel:
  - font
  - border radius
  - elevation/shadow
  - focus ring
  - surface contrast

### Token groups to define

- Brand
  - `--brand-primary`
  - `--brand-primary-hover`
  - `--brand-primary-soft`
  - `--brand-primary-rgb`
  - `--brand-accent`
  - `--brand-accent-soft`
  - `--brand-accent-rgb`
- Text
  - `--color-text-main`
  - `--color-text-strong`
  - `--color-text-muted`
  - `--color-text-inverse`
- Surface
  - `--color-surface-base`
  - `--color-surface-card`
  - `--color-surface-overlay`
  - `--color-surface-tint`
- Border
  - `--color-border-subtle`
  - `--color-border-strong`
  - `--color-border-brand`
- Status
  - `--color-success`
  - `--color-success-rgb`
  - `--color-warning`
  - `--color-warning-rgb`
  - `--color-danger`
  - `--color-danger-rgb`
- Effects
  - `--shadow-card`
  - `--shadow-card-hover`
  - `--shadow-brand-glow`
  - `--focus-ring-brand`
- Identity
  - `--font-sans`
  - `--radius-sm`
  - `--radius-md`
  - `--radius-lg`

### Deliverable

A documented and stable theme contract in `index.css` that components can consume consistently.

## Phase 2 - Normalize Shared Primitives

### Objective

Make shared building blocks brand-aware before touching lots of page-level code.

### Primary files

- `elearning-webapp/src/index.css`
- shared components and shared utility classes that are used across many screens

### Tasks

- Refactor shared classes to consume semantic tokens instead of literal Tailwind palettes.
- Normalize the following primitives first:
  - `.btn`
  - `.btn-primary`
  - `.btn-outline`
  - `.card`
  - `.badge`
  - `.form-input`
  - `.glass`
  - `.glass-card`
  - global focus styling
  - branded gradients such as `.bg-gradient-primary`
  - decorative backgrounds such as `.mesh-bg` and `.mesh-bg-premium`
- Convert hardcoded alpha values to token-driven rgb formulas where brand-colored.
- Keep neutral usage consistent. If a neutral is intentional and reusable, move it into tokens instead of leaving direct `slate-*` everywhere.

### Important rule

If a style represents reusable system meaning, it should use a semantic token.
If a style is truly one-off and decorative, it may remain local only if it still derives from theme variables.

### Deliverable

Most reusable UI primitives become brand-switchable by changing `index.css`.

## Phase 3 - Migrate High-Impact Screens

### Objective

Replace the most visible hardcoded brand styling in real screens.

### Priority areas

#### User-facing

- `elearning-webapp/src/pages/user/Home.jsx`
- `elearning-webapp/src/pages/user/CourseDetail.jsx`
- `elearning-webapp/src/pages/user/Rewards.jsx`
- `elearning-webapp/src/pages/user/CompletedCourses.jsx`
- `elearning-webapp/src/components/common/CourseCard.jsx`
- `elearning-webapp/src/components/common/CategoryPills.jsx`
- `elearning-webapp/src/components/common/SectionHeader.jsx`
- `elearning-webapp/src/components/common/VideoPlayer.jsx`
- `elearning-webapp/src/components/layout/UserLayout.jsx`
- `elearning-webapp/src/components/layout/UserLayout.css`

#### Admin-facing

- `elearning-webapp/src/pages/admin/RewardsManagement.jsx`
- `elearning-webapp/src/pages/admin/SystemSettings.jsx`
- `elearning-webapp/src/components/admin/UserModal.jsx`
- `elearning-webapp/src/components/admin/UserDetailModal.jsx`
- `elearning-webapp/src/components/layout/AdminLayout.jsx`
- `elearning-webapp/src/components/layout/AdminLayout.css`

### Tasks

- Replace hardcoded palette classes where they communicate brand or emphasis.
- Leave purely structural utility classes alone unless they block consistency.
- Standardize these patterns:
  - section labels
  - pills and badges
  - status chips
  - panel headers
  - action buttons
  - hover/focus states
  - selected tab and selected nav states
- Convert hardcoded gradient bars, glow effects, hero accents, and chip backgrounds to token-driven values.

### Deliverable

The most visible parts of the app respond correctly to a theme change.

## Phase 4 - Handle Special Cases and Embedded Styles

### Objective

Catch the parts that often get missed in rebranding work.

### Likely targets

- inline `style={{ ... }}` colors
- hardcoded `rgba(...)` overlays
- custom CSS files
- third-party component skinning such as player controls
- SVG fills where brand color matters

### Known examples

- `elearning-webapp/src/components/common/VideoPlayer.jsx`
- `elearning-webapp/src/components/layout/AdminLayout.css`
- `elearning-webapp/src/components/layout/UserLayout.css`
- `elearning-webapp/src/App.css`

### Tasks

- Replace literal player brand colors with CSS variable references.
- Normalize modal overlays and backdrop tinting.
- Decide whether generic decorative blue tones should become part of the official brand system or remain neutral accents.
- Remove leftover starter-template styling if unused.

### Deliverable

No major brand-colored UI remains tied to old hardcoded values.

## Phase 5 - Documentation and Rebrand Workflow

### Objective

Make the system maintainable for future developers and usable for client delivery.

### Files

- `elearning-webapp/BRAND_STYLE_GUIDE.md`

### Documentation to include

- token naming rules
- which tokens are foundation vs semantic
- how to add new UI without reintroducing hardcoded colors
- examples of approved usage
- do and do-not patterns
- rebranding checklist
- contrast and accessibility guidance

### Rebranding workflow to document

1. Update foundation brand tokens in `index.css`
2. Review generated semantic result
3. Run lint and build
4. Test key user/admin screens
5. Verify accessibility contrast
6. Capture screenshots for client approval

### Deliverable

A practical guide that makes the branding system transferable, not just implemented.

## Phase 6 - Optional Runtime Theme Support

### Objective

Prepare for future customer-specific theme switching without requiring a rebuild for every client.

### Recommended direction

Store a brand configuration object per tenant or per deployment and inject CSS variables at runtime.

### Future implementation options

- API-driven theme config fetched on app boot
- tenant-specific `data-theme` attribute
- admin-managed brand settings for enterprise customers
- environment-specific theme bundles for separate deployments

### Suggested config shape

```json
{
  "brandPrimary": "#4338CA",
  "brandPrimaryHover": "#3730A3",
  "brandAccent": "#F59E0B",
  "textMain": "#1E293B",
  "surfaceBase": "#F8FAFC",
  "surfaceCard": "#FFFFFF",
  "fontFamily": "Kanit, sans-serif",
  "radiusMd": "0.85rem"
}
```

### Note

This phase is not required to centralize the system now, but the earlier phases should avoid decisions that block this later.

## Migration Rules

To keep the work safe and incremental:

- Do not rename every existing token at once.
- Add the new semantic layer first, then gradually repoint old usage.
- Prefer aliasing old tokens to new ones during transition.
- Migrate shared primitives before deep page-level cleanup.
- Avoid mixing new semantic tokens with new hardcoded colors.
- If a component introduces a new color role, define that role centrally first.

## Design Rules

- Brand tokens should express intent, not current hue names.
- Neutral tokens should handle most layout and text styling.
- Accent usage should be deliberate and limited to highlights, reward moments, or special emphasis.
- Success, warning, and danger should stay semantic and not be reused as brand colors.
- Focus states must remain accessible after rebranding.
- Decorative gradients should derive from theme variables, not fixed literals.

## Risk Areas

### Risk 1 - Partial rebrand only

If we change only buttons and a few cards, the site will still feel tied to the old palette.

Mitigation:

- Explicitly audit hardcoded color usage.
- Include page-level and CSS-file cleanup in scope.

### Risk 2 - Token sprawl

Too many overlapping names will make the system harder to use.

Mitigation:

- Keep foundation vs semantic layers clear.
- Document naming rules in `BRAND_STYLE_GUIDE.md`.

### Risk 3 - Broken contrast after theme swap

Some client colors may be too light or too saturated.

Mitigation:

- Add manual contrast verification to acceptance criteria.
- Prefer controlled client palette inputs instead of arbitrary free-form colors.

### Risk 4 - Third-party styling mismatch

Embedded controls such as media players may remain off-brand.

Mitigation:

- Include special-case styling in the plan instead of treating it as cleanup later.

## Acceptance Criteria

The phase is complete when:

- changing the main brand tokens in `elearning-webapp/src/index.css` updates the visual identity across the major user/admin surfaces
- no major user-facing CTA, badge, hero accent, or selected-state style is stuck on old hardcoded brand colors
- glassmorphism, focus rings, shadows, and gradients that represent brand styling also adapt to the new theme
- documentation exists and explains how to rebrand safely
- lint and build pass after the refactor

## Verification Plan

### Functional verification

1. Change the primary brand to a clearly different color such as hot pink or emerald.
2. Change the accent color to a contrasting tone such as gold or coral.
3. Confirm major user/admin pages visually update without manual component edits.

### Coverage verification

Check at minimum:

- login and top-level app shell
- user home
- course card and course detail
- rewards screens
- admin layout
- admin modals
- settings and management screens
- video player controls

### Technical verification

- run lint
- run build
- search for leftover hardcoded brand colors and color-family utilities
- spot-check responsive views on desktop and mobile

### Accessibility verification

- verify text contrast for primary buttons, pills, and tinted cards
- verify focus ring visibility
- verify warning/danger chips remain distinguishable after brand swap

## Recommended Execution Order

1. Phase 1 - define the token contract in `index.css`
2. Phase 2 - normalize shared primitives
3. Phase 3 - migrate highest-traffic screens
4. Phase 4 - catch embedded and special-case styling
5. Phase 5 - write the brand guide
6. Phase 6 - optionally add runtime theme support later

## File-Level Task List

This section breaks the plan into implementation-ready tasks that can be executed file by file.

## Wave 1 - Theme Contract Foundation

### 1. `elearning-webapp/src/index.css`

#### Tasks

- Define foundation brand tokens:
  - primary
  - primary hover
  - accent
  - success
  - warning
  - danger
  - neutral base
  - neutral text
  - neutral border
- Add rgb token pairs for:
  - primary
  - accent
  - success
  - warning
  - danger
  - dark neutral if needed for overlays
- Define semantic aliases:
  - action primary
  - action primary hover
  - action accent
  - surface base
  - surface card
  - surface overlay
  - text main
  - text muted
  - text inverse
  - border subtle
  - border strong
- Normalize identity tokens:
  - font family
  - radius scale
  - shadow scale
  - focus ring
- Keep backward-compatible aliases for existing usage such as:
  - `--color-primary`
  - `--color-primary-hover`
  - `--color-primary-light`
  - `--color-background`
  - `--color-surface`
- Replace direct hardcoded focus ring and base background/text colors with token-driven values.

#### Done when

- a single token change in `@theme` updates the shared primitives correctly
- no branded base styles in `index.css` rely on literal hex except inside the token definitions themselves

## Wave 2 - Shared Primitives and Global Utilities

### 2. `elearning-webapp/src/index.css`

#### Tasks

- Refactor these shared classes to use semantic variables:
  - `.btn`
  - `.btn-primary`
  - `.btn-outline`
  - `.card`
  - `.badge`
  - `.glass`
  - `.glass-card`
  - `.form-input`
  - `.points-pill`
  - `.bg-gradient-primary`
  - `.text-gradient-primary`
  - `.mesh-bg`
  - `.mesh-bg-premium`
- Convert box shadows and glows to `rgb(var(--token-rgb) / alpha)` where brand tint is involved.
- Convert neutral borders and fills to semantic neutral tokens instead of raw `slate-*` equivalents where reusable.
- Decide which decorative blue tint remains part of the brand system and define it centrally if kept.

#### Done when

- buttons, cards, forms, focus states, and premium backgrounds all respond to token changes

### 3. `elearning-webapp/src/App.css`

#### Tasks

- Audit for leftover starter-template styles.
- Remove unused demo styling or migrate any still-used color rules into brand tokens.

#### Done when

- `App.css` no longer contains branding noise unrelated to the product

## Wave 3 - Shared User Components

### 4. `elearning-webapp/src/components/common/CourseCard.jsx`

#### Tasks

- Replace any hardcoded badge, highlight, hover, and progress accent colors with semantic utility usage.
- Ensure limited-time, status, and CTA styling derives from shared tokens.
- Normalize emphasis hierarchy:
  - title uses text-main
  - secondary metadata uses text-muted
  - badges use semantic status or accent tokens

#### Done when

- changing primary/accent updates course cards without manual edits

### 5. `elearning-webapp/src/components/common/CategoryPills.jsx`

#### Tasks

- Replace hardcoded gradient edge fade and selected-state palette usage with theme-aware classes or CSS variables.
- Convert temporary badge styling from literal amber family to accent/status token usage.
- Standardize active vs inactive pill states through semantic selection styling.

#### Done when

- the category strip looks correct under a different primary/accent palette

### 6. `elearning-webapp/src/components/common/SectionHeader.jsx`

#### Tasks

- Replace decorative gradient bar and limited-time badge colors with token-driven styles.
- Normalize title, supporting line, and action-link styling to semantic text and border tokens.

#### Done when

- section headers fully rebrand with no fixed accent literals

### 7. `elearning-webapp/src/components/common/RewardCard.jsx`

#### Tasks

- Audit reward highlight, points, and CTA accents.
- Move points emphasis to accent semantic tokens rather than local amber-like colors.

#### Done when

- reward cards visually align with the centralized accent system

### 8. `elearning-webapp/src/components/common/SearchInput.jsx`

#### Tasks

- Normalize icon tint, border, focus state, and placeholder styling to semantic tokens.

#### Done when

- search inputs visually match the shared form system

### 9. `elearning-webapp/src/components/common/FilterSidebar.jsx`

#### Tasks

- Replace chip, selected-filter, hover, and divider colors with semantic tokens.

#### Done when

- filters rebrand consistently with pills and cards

### 10. `elearning-webapp/src/components/common/CategorySearchModal.jsx`

#### Tasks

- Normalize overlay, panel tint, handle bar, empty states, and badge colors.
- Use overlay/surface tokens instead of direct `bg-slate-900/60` style values where possible.

#### Done when

- modal feels part of the same theme system as layouts and cards

### 11. `elearning-webapp/src/components/common/ModalPortal.jsx`

#### Tasks

- If overlay/backdrop colors are defined here or passed through, centralize them via semantic overlay tokens.

#### Done when

- all modal backdrops can be tuned centrally

### 12. `elearning-webapp/src/components/common/VideoPlayer.jsx`

#### Tasks

- Replace hardcoded player CSS variables and overlay colors with theme values.
- Convert play button, controls, focus/hover, and error state tinting to semantic token usage where supported by the player.
- Keep danger state semantic rather than brand-driven.

#### Done when

- embedded media controls no longer lock the app to the old primary hue

### 13. `elearning-webapp/src/components/common/DocViewer.jsx`

#### Tasks

- Audit loading, toolbar, and error states for hardcoded colors.
- Align with card, text, and overlay tokens if applicable.

#### Done when

- document viewer wrappers do not visually drift from the theme

### 14. `elearning-webapp/src/components/common/PdfCanvasViewer.jsx`

#### Tasks

- Audit background, controls, and loading/error colors.
- Normalize against semantic text, surface, and border tokens.

#### Done when

- PDF viewing states inherit global styling rules

### 15. `elearning-webapp/src/components/common/CustomDateTimePicker.jsx`

#### Tasks

- Replace selected date, hover date, active ring, and panel highlights with semantic tokens.

#### Done when

- custom date picker respects client branding

## Wave 4 - Layout Shells

### 16. `elearning-webapp/src/components/layout/UserLayout.jsx`

#### Tasks

- Replace selected nav, hover nav, logout, and sidebar accent styling with semantic classes.
- Remove direct palette assumptions from active nav states.

#### Done when

- main user shell reflects primary theme consistently

### 17. `elearning-webapp/src/components/layout/UserLayout.css`

#### Tasks

- Replace literal rgba backgrounds, borders, shadows, and logo glow with token-driven values.
- Standardize shell glassmorphism and bottom-nav styling.

#### Done when

- shell chrome can be rebranded centrally

### 18. `elearning-webapp/src/components/layout/AdminLayout.jsx`

#### Tasks

- Normalize active navigation, section labels, header controls, and badges to semantic tokens.

#### Done when

- admin shell shares the same brand system as the user shell

### 19. `elearning-webapp/src/components/layout/AdminLayout.css`

#### Tasks

- Replace hardcoded backdrop, header surface, menu active state, and border styling with semantic variables.

#### Done when

- admin chrome no longer depends on old tinted literals

## Wave 5 - High-Impact User Pages

### 20. `elearning-webapp/src/pages/auth/Login.jsx`

#### Tasks

- Normalize hero accent, primary CTA, focus states, helper text, and decorative panels to token-driven styles.
- Remove any old default Vite/indigo assumptions.

#### Done when

- login is a valid proof screen for one-click rebranding

### 21. `elearning-webapp/src/pages/user/Home.jsx`

#### Tasks

- Audit hero, section spacing accents, recommendation blocks, and temporary content callouts.
- Ensure page-level highlights depend on shared tokens, not local color literals.

#### Done when

- home page responds correctly to brand swaps

### 22. `elearning-webapp/src/pages/user/CourseDetail.jsx`

#### Tasks

- Normalize badges, sticky CTA area, lesson progress, completion states, and supporting chips.
- Convert any hardcoded background/gradient effects to semantic utilities.

#### Done when

- course detail uses only system brand patterns

### 23. `elearning-webapp/src/pages/user/Rewards.jsx`

#### Tasks

- Standardize points emphasis, filter states, category highlights, and redeem CTA styling.
- Align reward-related accent usage with the centralized accent token.

#### Done when

- rewards page no longer contains isolated accent logic

### 24. `elearning-webapp/src/pages/user/PointsHistory.jsx`

#### Tasks

- Replace points pill, history state chips, and any amber-specific styles with semantic accent usage.

#### Done when

- points history matches the reward system palette centrally

### 25. `elearning-webapp/src/pages/user/CompletedCourses.jsx`

#### Tasks

- Normalize search box, summary card, empty state icons, and neutral messaging colors.
- Ensure surface and border styling depend on global tokens.

#### Done when

- completed courses page inherits theme system cleanly

### 26. `elearning-webapp/src/pages/user/CourseList.jsx`

#### Tasks

- Normalize filters, selected state, cards container accents, and search interactions.

#### Done when

- browsing screens align with search, filter, and card token rules

### 27. `elearning-webapp/src/pages/user/OngoingCourses.jsx`

#### Tasks

- Audit progress-driven highlight and active-state surfaces.
- Ensure semantic success/accent/primary boundaries remain clear.

#### Done when

- progress-heavy views still rebrand without confusion

### 28. `elearning-webapp/src/pages/user/Profile.jsx`

#### Tasks

- Normalize profile cards, action buttons, section labels, and info chips.

#### Done when

- account screens stay visually on-brand

### 29. `elearning-webapp/src/pages/user/LessonPlayer.jsx`

#### Tasks

- Normalize the relationship between player shell, lesson list, progress states, and danger/warning messaging.
- Ensure lesson-selection visuals use semantic selection styling.

#### Done when

- learning playback surfaces feel brand-consistent end to end

### 30. `elearning-webapp/src/pages/user/GoalDetail.jsx`

#### Tasks

- Replace any hardcoded progress, section, or status palette logic with semantic token use.

#### Done when

- goal detail follows the same rules as rewards and course pages

## Wave 6 - High-Impact Admin Pages and Modals

### 31. `elearning-webapp/src/components/admin/UserModal.jsx`

#### Tasks

- Normalize form labels, note banners, footer actions, and modal shell styling.

#### Done when

- admin user editing reuses the central form and modal language

### 32. `elearning-webapp/src/components/admin/UserDetailModal.jsx`

#### Tasks

- Replace hardcoded stats-card fills, tab states, table accents, and badge colors with semantic tokens.
- Standardize info cards, table headers, and empty states.

#### Done when

- admin detail modal rebrands cleanly and consistently

### 33. `elearning-webapp/src/components/admin/RewardModal.jsx`

#### Tasks

- Normalize reward preview, points emphasis, upload state, and action buttons.

#### Done when

- reward creation follows the same accent rules as rewards page

### 34. `elearning-webapp/src/components/admin/CourseModal.jsx`

#### Tasks

- Replace form focus, temporary badge, schedule controls, and helper states with semantic tokens.

#### Done when

- course create/edit modal inherits shared brand rules

### 35. `elearning-webapp/src/components/admin/LessonModal.jsx`

#### Tasks

- Normalize tabs, upload states, media states, and footer actions.

#### Done when

- lesson authoring feels consistent with other admin modals

### 36. `elearning-webapp/src/components/admin/ReferenceDataModal.jsx`

#### Tasks

- Normalize modal shell, list item selection, and action emphasis.

#### Done when

- reference workflows no longer use local palette choices

### 37. `elearning-webapp/src/components/admin/QuizBuilder.jsx`

#### Tasks

- Replace correct/incorrect/question-type accents with semantic tokens.
- Keep success/danger meaning separate from brand-primary meaning.

#### Done when

- quiz UI uses proper semantic color roles

### 38. `elearning-webapp/src/components/admin/BenefitListEditor.jsx`

#### Tasks

- Normalize add/remove actions, list item accents, and helper UI.

#### Done when

- list editors align with the global form system

### 39. `elearning-webapp/src/components/admin/OutcomeListEditor.jsx`

#### Tasks

- Same normalization approach as `BenefitListEditor.jsx`.

#### Done when

- repeated editors share a consistent branded language

### 40. `elearning-webapp/src/components/admin/AdminPageHeader.jsx`

#### Tasks

- Centralize section label, subtitle, CTA, and divider styling.

#### Done when

- admin page headers become reusable and theme-safe

### 41. `elearning-webapp/src/components/admin/AdminTable.jsx`

#### Tasks

- Normalize table header fills, row hover, empty states, action states, and selected-row styling.

#### Done when

- tables respond to the theme with no page-specific fixes required

### 42. `elearning-webapp/src/pages/admin/SystemSettings.jsx`

#### Tasks

- Replace panel icon background, success/error alerts, action buttons, and helper cards with semantic tokens.
- Treat this page as an admin-side proof page for the theme system.

#### Done when

- settings page visibly rebrands with only token edits

### 43. `elearning-webapp/src/pages/admin/RewardsManagement.jsx`

#### Tasks

- Normalize empty states, preview cards, table/list views, image placeholders, and destructive actions.

#### Done when

- rewards admin area no longer uses isolated indigo/red styling

### 44. `elearning-webapp/src/pages/admin/CourseManagement.jsx`

#### Tasks

- Normalize category/course tabs, archive states, temporary badges, action buttons, and filters.

#### Done when

- course management reflects the same semantic brand system as user-side course views

### 45. `elearning-webapp/src/pages/admin/GoalManagement.jsx`

#### Tasks

- Replace goal status, progress accents, and panel states with semantic token usage.

#### Done when

- goals UI uses consistent success/accent/primary boundaries

### 46. `elearning-webapp/src/pages/admin/UserManagement.jsx`

#### Tasks

- Normalize filters, destructive links, summary states, and selected-row emphasis.

#### Done when

- user management no longer mixes local red/neutral styles ad hoc

### 47. `elearning-webapp/src/pages/admin/RedeemRequests.jsx`

#### Tasks

- Standardize request status badges, approve/reject controls, and processed-state visuals.
- Keep approve/reject semantics tied to success/danger rather than brand-primary.

#### Done when

- redemption workflow is visually consistent and semantically correct

### 48. `elearning-webapp/src/pages/admin/Dashboard.jsx`

#### Tasks

- Audit KPI cards, trend indicators, and shortcut tiles for hardcoded palette usage.

#### Done when

- dashboard summary visuals react to theme changes

### 49. `elearning-webapp/src/pages/admin/Reports.jsx`

#### Tasks

- Normalize charts wrapper, filter chips, stat cards, and export actions.

#### Done when

- reporting pages align with the rest of admin styling

## Wave 7 - Audit Remaining Shared/Admin Files

### 50. Remaining files to audit for token compliance

- `elearning-webapp/src/components/admin/RewardModal.jsx`
- `elearning-webapp/src/components/auth/ProtectedRoute.jsx`
- `elearning-webapp/src/components/common/SearchInput.jsx`
- `elearning-webapp/src/components/common/FilterSidebar.jsx`
- any future `.css` file under `src/components` or `src/pages`

#### Tasks

- Search for leftover hardcoded brand colors, palette family utilities, direct `rgba(...)`, and literal hex values.
- Either migrate them to semantic token usage or explicitly document why they stay local.

#### Done when

- remaining leftovers are either migrated or intentionally accepted

## Wave 8 - Documentation

### 51. `elearning-webapp/BRAND_STYLE_GUIDE.md`

#### Tasks

- Document token taxonomy.
- Document naming rules.
- Document examples of correct component usage.
- Add rebranding instructions for developers.
- Add a checklist for client theme QA.
- Add examples for:
  - button
  - card
  - badge
  - selected navigation
  - warning/danger status

#### Done when

- a developer unfamiliar with the project can rebrand the app safely from the guide

## Wave 9 - Runtime Theme Readiness

### 52. Future-ready files to plan for

- `elearning-webapp/src/main.jsx`
- `elearning-webapp/src/App.jsx`
- future theme loader utility such as `elearning-webapp/src/utils/theme.js`
- future admin/system settings integration if tenant branding becomes configurable

#### Tasks

- Decide where runtime theme variables would be injected.
- Keep current token naming compatible with API-driven overrides.
- Avoid hard-wiring theme assumptions that would block a later `data-theme` or `:root` override model.

#### Done when

- the static theme system can evolve into a runtime theme system without large refactors

## Suggested Working Sequence

Use this execution sequence to keep the rollout controlled:

1. `index.css`
2. `App.css`
3. shared common components
4. layout shells
5. user pages
6. admin components and pages
7. documentation
8. runtime-readiness cleanup

## Suggested Verification Checkpoint After Each Wave

- run lint
- run build
- visually check one user page and one admin page
- grep for leftover palette literals related to the files in that wave

## Practical Next Step

Start with a small but foundational implementation slice:

1. Refactor `elearning-webapp/src/index.css` into foundation plus semantic tokens.
2. Update the shared classes in the same file to consume those tokens.
3. Migrate `CourseCard`, `CategoryPills`, `SectionHeader`, `UserLayout`, and `SystemSettings` as the first proof that the brand system works across both user and admin areas.

This will give us a high-confidence base before doing the full app-wide cleanup.
