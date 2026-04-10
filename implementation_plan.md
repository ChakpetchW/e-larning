# Implementation Plan - Temporary Categories & Courses

## Refined Scope

The original plan mixed automatic expiry with a new manual archive status for categories. After reviewing the current codebase, a simpler and safer approach is to treat archive state as a derived result of:

- `isTemporary === true`
- `expiredAt <= now()`

This keeps the behavior consistent for both categories and courses, avoids a redundant status column, and fits the existing visibility system already used by user/admin services.

## Decisions Applied

- Add `isTemporary` and `expiredAt` to both `Category` and `Course`.
- Keep archive state derived instead of storing a separate `ARCHIVED` status.
- Reuse existing admin update endpoints for editing temporary content.
- Add dedicated `republish` endpoints that clear temporary expiry and make the item visible again.
- Keep user-facing ordering simple: temporary categories appear first, then regular category order.
- Add lightweight "Limited Time" treatment on the home page and course cards.

## Backend Changes

### Prisma

- Update `elearning-api/prisma/schema.prisma`
  - `Category.isTemporary: Boolean @default(false)`
  - `Category.expiredAt: DateTime?`
  - `Course.isTemporary: Boolean @default(false)`
  - `Course.expiredAt: DateTime?`
- Add a migration for the new fields.

### User Service

- Update `elearning-api/src/services/user.service.js`
  - Fold temporary expiry checks into the existing visibility flow.
  - Hide expired temporary categories from `/user/categories`.
  - Hide expired temporary courses from `/user/courses` and `/user/courses/:id`.
  - Hide courses whose parent category has already expired.
  - Sort visible categories by temporary-first, then `order`.

### Admin Service

- Update `elearning-api/src/services/admin.service.js`
  - Accept `isTemporary` and `expiredAt` in category/course payloads.
  - Validate that temporary items include an expiration date.
  - Return derived `isArchived` flags for admin lists.
  - Add `republishCourse` and `republishCategory`.

### Admin API

- Add republish routes/controllers:
  - `PUT /admin/courses/:id/republish`
  - `PUT /admin/categories/:id/republish`

## Frontend Changes

### Admin

- Update `elearning-webapp/src/pages/admin/CourseManagement.jsx`
  - Add active/archive toggles for courses.
  - Add active/archive toggles for categories.
  - Show temporary/archive badges and expiration timestamps.
  - Add republish actions.
- Update `elearning-webapp/src/components/admin/CourseModal.jsx`
  - Add "Temporary" toggle.
  - Add expiration datetime field.

### User

- Update `elearning-webapp/src/pages/user/Home.jsx`
  - Preserve API category ordering so temporary categories appear first.
  - Show a limited-time badge on temporary category sections.
- Update shared presentation components so temporary categories/courses are visually distinguishable.

## Verification

1. Create a temporary category and temporary course with an expiration a few minutes ahead.
2. Confirm both appear in admin active views and on the user home page.
3. After expiry, confirm they disappear from user endpoints/views.
4. Confirm they appear in admin archive views.
5. Use republish and confirm they reappear.
