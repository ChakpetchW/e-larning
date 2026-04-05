# 📝 Next Edit Tasks (v1.0.3+)

Track here all reported bugs and UI/UX improvements to be addressed in the next iteration.

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

## 🟢 Completed (v1.0.2)
- [x] **Video Navigation Sticking**:
  - **Issue**: If a video is playing, clicking "Next Lesson" (`onNext`) does not trigger navigation.
  - **Fix**: Implemented `isNavigatingAway` state in `LessonPlayer.jsx` to prevent video state from blocking navigation and used `requestAnimationFrame` for clean navigation transitions.
- [x] **Button Text Wrapping (Desktop)**:
  - **Issue**: In the "Lesson Complete" container, navigation buttons wrap into two lines.
  - **Fix**: Added `whitespace-nowrap` to buttons and optimized flex containers for better responsiveness.

---
*Created on 2025-04-05*


