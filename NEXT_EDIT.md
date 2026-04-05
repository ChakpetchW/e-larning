# 📝 Next Edit Tasks (v1.0.4+)

Track here all reported bugs and UI/UX improvements to be addressed in the next iteration.

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


