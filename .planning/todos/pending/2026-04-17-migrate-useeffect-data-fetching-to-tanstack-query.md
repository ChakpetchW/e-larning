---
created: 2026-04-17T18:17:02.829Z
title: Migrate useEffect data fetching to TanStack Query
area: ui
files:
  - elearning-webapp/src/pages/user/LessonPlayer.jsx
  - elearning-webapp/src/pages/user/CourseDetail.jsx
  - elearning-webapp/src/pages/user/CourseList.jsx
  - elearning-webapp/src/pages/user/AnnouncementPlayer.jsx
  - elearning-webapp/src/pages/user/Home.jsx
  - elearning-webapp/src/pages/admin/Dashboard.jsx
---

## Problem

ทุกหน้าใน elearning-webapp (20 ไฟล์) ใช้ `useEffect + useState + loading` ในการ fetch ข้อมูลซึ่งมีปัญหาสะสม:

- **Race condition**: navigate เร็วๆ ระหว่าง lesson → request เก่าทับ request ใหม่
- **Unstable deps bug**: `toast` หรือ object อื่นใน deps array ทำให้ effect ยิงซ้ำ — พบ bug จริงใน `LessonPlayer.jsx` ที่ `toast` ใน deps ทำให้ `setQuizResult(null)` ถูกเรียกทันทีหลัง submit ทำให้ result container หายไป (แก้ชั่วคราวโดยเอา toast ออกจาก deps แล้ว)
- **ไม่มี cache**: navigate กลับหน้าเดิม → fetch ใหม่ทุกครั้ง
- **Code ซ้ำซ้อน**: loading/error/data state pattern เดิมซ้ำในทุกไฟล์

## Solution

Migrate ไปใช้ **TanStack Query v5** (`@tanstack/react-query`)

แผนละเอียดอยู่ที่: `C:\Users\AlexWang\.gemini\antigravity\brain\44a66485-a5f6-4f92-9efe-902344989967/implementation_plan_tanstack_query.md`

**4 Steps หลัก:**
1. Install + setup `QueryClientProvider` ใน `main.jsx`
2. สร้าง `src/utils/queryKeys.js` — convention กลาง
3. สร้าง custom hooks layer: `useLessonPlayer`, `useSubmitQuiz`, etc.
4. Migrate ทีละ Priority group (A→B→C) บน feature branch แยก

**Priority A (ทำก่อน):** `LessonPlayer`, `CourseDetail`, `CourseList`, `AnnouncementPlayer`, `Home`, `GoalDetail`
