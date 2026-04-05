# 📝 Next Edit Tasks (v1.0.1+)

Track here all reported bugs and UI/UX improvements to be addressed in the next iteration.

## 🔴 Critical Bug
- [ ] **Video Navigation Sticking**:
  - **Issue**: If a video is playing, clicking "Next Lesson" (`onNext`) does not trigger navigation. Currently requires pausing the video first.
  - **Proposed Fix**: Ensure `navigate` event is not blocked by video state or any `beforeunload` listeners. Check `LessonPlayer.jsx` and `DocViewer.jsx` integration.

## 🎨 UI/UX Refinement
- [ ] **Button Text Wrapping (Desktop)**:
  - **Issue**: In the "Lesson Complete" container, navigation buttons ("กลับหน้าคอร์ส", "ไปบทถัดไป") wrap into two lines on desktop.
  - **Target**: Ensure buttons stay on 1 line. Use `white-space: nowrap` and adjust flex containers/padding.

---
*Created on 2025-04-05*
