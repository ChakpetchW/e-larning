# UI Audit Report

Date: 2026-04-03
Scope: `elearning-webapp/src`
Method: static code audit, design anti-pattern review, `npm run lint`, `npm run build`

## Anti-Patterns Verdict

Fail. The UI currently reads as AI-generated in several high-visibility places.

Specific tells:
- Purple/indigo-first palette with repeated glow, blur, and glass treatments across login, home, rewards, lesson, and modal surfaces.
- Hero-metric dashboard pattern on the home page with oversized counts and decorative gradient/glow backing.
- Heavy use of rounded white cards, soft shadows, and interchangeable card grids.
- Decorative English buzzwords (`WELCOME BACK`, `Knowledge Check`, `Documentary Lesson`, `Progress`) mixed into a primarily Thai product without a clear brand rationale.
- Repeated glassmorphism and blob backgrounds that add style noise more than product meaning.

## Executive Summary

- Total issues found: 11
- Severity mix: 1 Critical, 4 High, 4 Medium, 2 Low
- Most critical issues:
  1. Core learning interactions are still mouse-first because several primary actions are implemented on non-semantic containers.
  2. Custom modals/drawers have no dialog semantics, no focus management, and no Escape handling.
  3. Form labels and several icon-only controls are not programmatically accessible.
  4. Theming is inconsistent because multiple custom classes and CSS variables are referenced but never defined.
- Verification:
  - `cmd /c npm run build`: passed
  - `cmd /c npm run lint`: failed with 18 errors

## Detailed Findings By Severity

### Critical Issues

#### 1. Core navigation and lesson actions are implemented on non-semantic containers
- Location: `src/components/common/CourseCard.jsx:9`, `src/pages/user/Home.jsx:119`, `src/pages/user/Home.jsx:226`, `src/pages/user/CourseDetail.jsx:194`, `src/components/common/VideoPlayer.jsx:52`
- Severity: Critical
- Category: Accessibility
- Description: Several primary actions use clickable `div` containers instead of native `button` or `a` elements.
- Impact: Keyboard users and some assistive-tech users can miss core flows like opening a course, resuming a lesson, previewing content, or launching reward navigation.
- WCAG/Standard: WCAG 2.1.1 Keyboard, WCAG 4.1.2 Name, Role, Value
- Recommendation: Replace interactive containers with semantic controls, preserve hover styling on the semantic element, and add keyboard-visible focus states.
- Suggested command: `/harden`

### High-Severity Issues

#### 2. All custom modals and drawers are missing dialog semantics and focus management
- Location: `src/components/common/CategorySearchModal.jsx:37`, `src/components/common/FilterSidebar.jsx:15`, `src/pages/user/Profile.jsx:191`, `src/pages/user/Profile.jsx:239`, `src/components/layout/AdminLayout.jsx:40`
- Severity: High
- Category: Accessibility
- Description: A repo-wide scan found no `role="dialog"`, `aria-modal`, `aria-labelledby`, `aria-describedby`, `Escape`, `onKeyDown`, or `tabIndex` support for overlay patterns.
- Impact: Screen-reader users do not get modal context, keyboard focus can escape behind overlays, and dismissal depends on pointer interaction.
- WCAG/Standard: WCAG 2.1.2 No Keyboard Trap, WCAG 2.4.3 Focus Order, WCAG 4.1.2 Name, Role, Value
- Recommendation: Standardize overlays on an accessible dialog primitive with initial focus, focus return, Escape close, inert background, and accessible labelling.
- Suggested command: `/harden`

#### 3. Labels and icon-only controls are not programmatically accessible
- Location: `src/pages/auth/Login.jsx:67`, `src/pages/auth/Login.jsx:78`, `src/pages/user/Profile.jsx:90`, `src/pages/user/Profile.jsx:196`, `src/pages/user/Profile.jsx:207`, `src/components/common/CategorySearchModal.jsx:63`
- Severity: High
- Category: Accessibility
- Description: Many labels are visual-only because they are not tied to inputs with `htmlFor` and matching `id`. Several icon-only buttons also lack accessible names.
- Impact: Screen-reader users lose field context and button purpose, especially in login, profile, and modal close/settings actions.
- WCAG/Standard: WCAG 1.3.1 Info and Relationships, WCAG 3.3.2 Labels or Instructions, WCAG 4.1.2 Name, Role, Value
- Recommendation: Add `id`/`htmlFor` pairs for all inputs and `aria-label` on icon-only buttons.
- Suggested command: `/harden`

#### 4. Theming integrity is broken by undefined CSS variables and undefined custom classes
- Location: `src/components/layout/AdminLayout.css:36`, `src/components/layout/AdminLayout.css:61`, `src/components/layout/AdminLayout.css:73`, `src/components/layout/AdminLayout.css:76`, `src/components/layout/AdminLayout.css:131`, `src/components/layout/UserLayout.css:87`, `src/components/layout/UserLayout.css:90`, `src/pages/user/Home.jsx:76`, `src/pages/user/Home.jsx:83`, `src/pages/user/Home.jsx:90`, `src/pages/user/Home.jsx:120`, `src/pages/user/Home.jsx:151`
- Severity: High
- Category: Theming
- Description: Admin and user layout CSS reference variables like `--color-border`, `--color-text-main`, `--color-text-muted`, `--radius-md`, `--transition-fast`, and `--shadow-xl` that are not defined in `src/index.css`. Home also relies on classes such as `mesh-bg-premium`, `glass-card`, `text-gradient-primary`, and `animate-slide-up` that are never defined.
- Impact: Intended styling silently falls back or disappears, which produces inconsistent visuals and makes theme changes unreliable.
- WCAG/Standard: Design-system integrity / maintainability issue
- Recommendation: Consolidate tokens in one source of truth, remove dead class names, and audit for undefined utility aliases before further visual polish.
- Suggested command: `/normalize`

#### 5. Accessible text contrast is weak in many small-label surfaces
- Location: `src/pages/user/Home.jsx:100`, `src/pages/user/Home.jsx:173`, `src/components/common/CourseCard.jsx:37`, `src/components/common/CourseCard.jsx:73`, `src/components/common/CategorySearchModal.jsx:108`, `src/pages/user/Rewards.jsx:142`
- Severity: High
- Category: Accessibility
- Description: The UI repeatedly uses `text-slate-400`, `text-gray-400`, and similar low-contrast tokens on white or near-white backgrounds, often at `10px` to `11px`.
- Impact: Secondary information like metadata, labels, and status cues becomes hard to read for low-vision users and on lower-quality mobile displays.
- WCAG/Standard: WCAG 1.4.3 Contrast (Minimum)
- Recommendation: Promote muted text to darker tokens, especially for text under 14px, and stop using ultra-light grays for important metadata.
- Suggested command: `/normalize`

### Medium-Severity Issues

#### 6. The home, login, rewards, and lesson screens overuse current AI-style visual tropes
- Location: `src/pages/auth/Login.jsx:49`, `src/pages/user/Home.jsx:76`, `src/pages/user/Rewards.jsx:73`, `src/pages/user/LessonPlayer.jsx:136`
- Severity: Medium
- Category: Anti-Patterns
- Description: Glass cards, blurred blobs, purple gradients, giant rounded cards, and metric-heavy hero sections recur across the app.
- Impact: The product looks templated rather than branded, which weakens trust and memorability.
- WCAG/Standard: Frontend design anti-patterns from the `frontend-design` skill
- Recommendation: Pick a clearer visual direction, remove decorative glass/blur that does not support meaning, and reduce repeated card-grid treatment.
- Suggested command: `/critique`

#### 7. Responsive behavior is handled mostly by shrinking layouts rather than adapting them
- Location: `src/components/layout/UserLayout.css:30`, `src/components/layout/UserLayout.css:57`, `src/components/layout/UserLayout.css:76`, `src/components/layout/UserLayout.jsx:37`, `src/components/layout/UserLayout.jsx:90`, `src/components/common/CategorySearchModal.jsx:48`, `src/pages/user/Home.jsx:248`, `src/pages/user/Home.jsx:265`
- Severity: Medium
- Category: Responsive
- Description: The app uses fixed header/footer heights, fixed sidebar width, `90vh` modal heights, and fixed-width horizontal cards (`w-[280px]`) in several mobile flows.
- Impact: Large text, landscape devices, smaller Android viewports, and embedded browser contexts are more likely to clip content or feel cramped.
- WCAG/Standard: WCAG 1.4.4 Resize Text, responsive best practices
- Recommendation: Test with 200% text zoom, replace rigid heights with content-driven sizing where possible, and adapt component structure instead of relying on fixed dimensions.
- Suggested command: `/adapt`

#### 8. Motion is decorative, heavy on blur/glow, and does not honor reduced-motion needs
- Location: `src/components/common/VideoPlayer.jsx:67`, `src/pages/user/Home.jsx:120`, `src/pages/user/LessonPlayer.jsx:138`, `src/pages/user/LessonPlayer.jsx:333`
- Severity: Medium
- Category: Performance
- Description: Decorative animation patterns include ping, pulse, hover lifts, glows, and blur-heavy surfaces, but there is no active reduced-motion strategy in the current app code.
- Impact: Motion-sensitive users get no escape hatch, and blur-heavy layers can feel sluggish on lower-end mobile hardware.
- WCAG/Standard: WCAG 2.3.3 Animation from Interactions, performance best practices
- Recommendation: Add `prefers-reduced-motion` handling, reduce decorative motion, and reserve heavy effects for a few intentional moments.
- Suggested command: `/optimize`

#### 9. Static verification shows render-purity and maintainability problems
- Location: `src/components/common/CourseCard.jsx:45`, `src/components/common/VideoPlayer.jsx:33`, plus 16 additional lint errors across admin/user files
- Severity: Medium
- Category: Performance
- Description: `npm run lint` fails with 18 errors, including an impure `Date.now()` call during render and a synchronous `setState` inside an effect.
- Impact: These issues increase maintenance friction and raise the risk of unpredictable rerenders or hard-to-debug UI behavior as the app grows.
- WCAG/Standard: React lint / performance hygiene
- Recommendation: Clear the lint backlog before adding more UI polish, starting with render-purity and effect-driven state issues.
- Suggested command: `/optimize`

### Low-Severity Issues

#### 10. Theme values are repeatedly hard-coded instead of consistently tokenized
- Location: `src/index.css:4`, `src/pages/admin/Dashboard.jsx:10`, `src/pages/admin/Dashboard.jsx:95`, `src/pages/admin/Dashboard.jsx:112`, `src/pages/user/CourseList.jsx:62`, `src/pages/user/CompletedCourses.jsx:35`
- Severity: Low
- Category: Theming
- Description: Core colors appear in CSS variables in one place, but many screens also hard-code hex values, arbitrary colors, and chart fills directly inside components.
- Impact: Future theme changes will be expensive and inconsistent, especially if dark mode or brand refresh work is added later.
- WCAG/Standard: Design-system maintainability
- Recommendation: Route charts, overlays, and sticky headers through shared tokens rather than one-off literals.
- Suggested command: `/extract`

#### 11. Dead or stale presentation assets are still in the repo
- Location: `src/App.css`, `src/pages/user/Home.jsx.bak`, `src/assets/react.svg`, `public/vite.svg`
- Severity: Low
- Category: Performance
- Description: The repo still contains starter/demo or backup presentation assets that no longer reflect the active UI.
- Impact: This adds noise during maintenance and makes it harder to tell which styles and assets are authoritative.
- WCAG/Standard: N/A
- Recommendation: Remove stale UI files once the active implementation is confirmed.
- Suggested command: `/distill`

## Patterns And Systemic Issues

- Accessibility debt is systemic, not isolated: missing semantic interactions, missing modal semantics, missing keyboard patterns, and missing programmatic labels all recur across the app.
- The design system is only partially real: some colors exist as tokens, but many classes and CSS variables are undefined or bypassed.
- The UI language lacks a consistent editorial standard: Thai product copy is mixed with English headings and generic tech phrases.
- Decorative polish is being added faster than foundational resilience.

## Positive Findings

- Route-level lazy loading is already in place in `src/App.jsx`, which is a strong baseline for keeping initial load smaller.
- The app does provide distinct mobile and desktop navigation patterns instead of hiding the whole navigation on smaller screens.
- Search, filter, reward, profile, and lesson experiences are decomposed into reusable components rather than one giant page file.
- Production build succeeds, so the current codebase is deployable even though lint quality needs work.

## Recommendations By Priority

1. Immediate
- Fix keyboard access for clickable cards, lesson rows, preview surfaces, and reward/home CTAs.
- Standardize all overlays on accessible dialog behavior.
- Wire labels and icon buttons for assistive technology.

2. Short-term
- Clean up undefined CSS variables and missing custom classes.
- Raise contrast on small metadata text and status labels.
- Resolve the 18 lint errors, starting with `CourseCard` and `VideoPlayer`.

3. Medium-term
- Rework the home/rewards/login visual direction to remove templated glassmorphism and hero-metric patterns.
- Replace rigid height/width decisions with more adaptive component behavior.

4. Long-term
- Build a real token system for charts, overlays, spacing, typography, and motion.
- Establish a product voice guide so Thai/English usage feels intentional instead of incidental.

## Suggested Commands For Fixes

- Use `/harden` to address keyboard access, dialog semantics, labels, and accessible names.
- Use `/normalize` to unify tokens, remove undefined style hooks, and improve contrast consistency.
- Use `/adapt` to make modals, nav chrome, and horizontal card sections behave better on small screens and at larger text sizes.
- Use `/optimize` to clear lint failures, reduce decorative motion cost, and tighten render behavior.
- Use `/critique` to redesign the product’s visual direction away from AI-slop fingerprints.
- Use `/distill` to remove stale assets and simplify over-decorated surfaces.
