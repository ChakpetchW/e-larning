# 📝 Next Edit Tasks (v1.0.9+)

Track here all reported bugs and UI/UX improvements to be addressed in the next iteration.

## 🟢 Completed (v1.0.9)
- [x] **In-House Cleanup: Remove Public Metrics**:
  - **Issue**: Marketing-style metrics (Bio, Ratings, Reviews, Student counts) are not needed for an in-house app.
  - **Fix**: Removed these fields from `CourseDetail.jsx`, `CourseModal.jsx`, `CourseManagement.jsx`, and `Dashboard.jsx`.

## 🟢 Completed (v1.0.8)
- [x] **SecureDocViewer: Universal Shortcut Block**:
  - **Issue**: "Open original" button in Google Docs viewer was still clickable on Desktop, allowing users to bypass document protections.
  - **Fix**: Removed viewport restrictions from the protective overlay. The transparent blocking `div` now covers the top-right corner on both Mobile and Desktop viewports.

## 🟢 Completed (v1.0.7)
- [x] **Critical Fix: Desktop Specificity Conflict (Real White Screen Fix)**:
  - **Issue**: Manual CSS rule `.user-layout { flex-direction: column }` was overriding Tailwind's `md:flex-row`.
  - **Result**: Content was stacked vertically below the sidebar, pushed off-screen.
  - **Fix**: Removed the conflicting CSS rules, allowing Tailwind's responsive classes to correctly align Sidebar and Content side-by-side on Desktop.

## 🟢 Completed (v1.0.6)
- [x] **Critical Fix: Desktop White Screen (0px Height)**:
  - **Issue**: Content area collapsed to 0px height on Desktop viewports due to improper Flexbox `h-full` and `flex-1` interaction in `md:flex-row` mode.
  - **Fix**: Refactored `UserLayout` containers to use `flex-1` with `min-h-0` and added `display: flex` to the `.user-main` container to ensure vertical expansion.

## 🟢 Completed (v1.0.5)
- [x] **Layout: Mobile Stabilization**:
  - **Issue**: Layout jumping or incorrect padding on mobile devices with safe-area insets.
  - **Fix**: Refactored `UserLayout` with CSS variables for dynamic padding and added `user-main-inner` container for consistent width/spacing control across viewports.
- [x] **DocViewer: PDF Viewing Experience**:
  - **Issue**: PDF toolbar and navigation panes sometimes visible even when requested off.
  - **Fix**: Updated viewer URL parameters (`pagemode=none&zoom=page-fit`) to ensure a cleaner, document-focused view by default on desktop.
- [x] **Admin: Dashboard Chart Responsiveness**:
  - **Issue**: Recharts components sometimes overflowing their containers or causing horizontal scroll on dashboard.
  - **Fix**: Added `min-w-0` to flex/grid containers and explicitly set `minWidth={0}` on `ResponsiveContainer` to correctly trigger re-calculation on resize.

## 🟢 Completed (v1.0.4)
- [x] **Accessibility: Visual Scrollbars**:
  - **Issue**: Hidden scrollbars made content discoverability poor.
  - **Fix**: Replaced `display: none` with a thin, modern, semi-transparent scrollbar in `index.css` for `.no-scrollbar`.
- [x] **UI: Reduced Glassmorphism Slops**:
  - **Issue**: Excessive blur and low opacity in glass cards looked generic (AI Slop).
  - **Fix**: Increased background opacity and reduced blur radius in `.glass-card` for a more polished, stable look.
- [x] **Identity: Enhanced Section Headers**:
  - **Issue**: Section headers were too generic.
  - **Fix**: Added a custom horizontal gradient bar and decorative line to `SectionHeader.jsx` to create a stronger visual identity.
- [x] **Normalization: Systemic UI Cleanup**:
  - **Fix**: Applied consistent border colors and shadows across `CourseCard`, `Home`, and `Profile` to align with the core design system.

## 🟢 Completed (v1.0.3)
- [x] **Universal Scroll-to-Top**:
  - **Issue**: Navigating between pages (Admin & User) didn't reset scroll position, leaving users at the bottom of the new page.
  - **Fix**: Added `useEffect` and `useRef` to `UserLayout` and `AdminLayout` to force `window.scrollTo(0,0)` and local main container scroll reset on route changes.
- [x] **Profile Cleanup**:
  - **Issue**: Unused `coursesLoading` state in `Profile.jsx`.
  - **Fix**: Removed redundant state and simplified logic.
- [x] **Course Detail Navigation Fix**:
  - **Issue**: Back button on course detail uses `navigate(-1)` which can lead back to a lesson.
  - **Fix**: Changed navigation to a static `/user/courses` path for better UX consistency.
- [x] **Google Docs Viewer Shortcut Block**:
  - **Issue**: Google Docs viewer top-right "Open original" button allows users to bypass security on mobile.
  - **Fix**: Added a transparent `div` overlay in `DocViewer.jsx` for mobile viewports to intercept touch events on the shortcut region.

## 🟢 Completed (v1.0.2)
- [x] **Video Navigation Sticking**:
  - **Issue**: If a video is playing, clicking "Next Lesson" (`onNext`) does not trigger navigation.
  - **Fix**: Implemented `isNavigatingAway` state in `LessonPlayer.jsx` to prevent video state from blocking navigation and used `requestAnimationFrame` for clean navigation transitions.
- [x] **Button Text Wrapping (Desktop)**:
  - **Issue**: In the "Lesson Complete" container, navigation buttons wrap into two lines.
  - **Fix**: Added `whitespace-nowrap` to buttons and optimized flex containers for better responsiveness.

---
*Created on 2025-04-05*


