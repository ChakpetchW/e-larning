# Technical Debt Report & Strategic Roadmap

This document is the working source of truth for technical debt across the e-learning platform. It is intentionally grounded in the current codebase rather than generic best practices.

Related documents:

- [implementation_plan.md](d:/งาน/AI%20Project/implementation_plan.md): detailed implementation plan for centralized brand CI and theming
- [NEXT_EDIT.md](d:/งาน/AI%20Project/NEXT_EDIT.md): small fixes, bugs, and next-iteration UI work

## Purpose

This report exists to answer three questions:

1. What debt is real and validated in the current codebase?
2. What should be fixed first based on risk and leverage?
3. Which implementation track already has a deeper plan elsewhere?

## Validated Snapshot

Validated against the current repository on 2026-04-10.

### Architecture reality

- Frontend: React 19 + Vite + Tailwind v4
- Backend: Express + Prisma
- Database: PostgreSQL
- Auth model in production code: JWT verified in middleware, then user role/tier access resolved in backend services
- Supabase is present as infrastructure dependency, but the application request path is not currently built around Supabase Auth session context

### What this means

Some ideas from older reports need to be corrected:

- Database RLS is not the immediate foundation of the app today
- `auth.uid()`-style policy drafts do not match the current runtime model
- the centralized branding effort is real and already has a stronger implementation plan in [implementation_plan.md](d:/งาน/AI%20Project/implementation_plan.md)

## Current Debt Inventory

## 1. Critical Security Debt

### 1.1 Hardcoded database credential in source control

File:

- [schema.prisma](d:/งาน/AI%20Project/elearning-api/prisma/schema.prisma:7)

Finding:

- `directUrl` contains a real PostgreSQL connection string directly in the schema file.

Risk:

- credential exposure
- accidental reuse across environments
- leaked secret in source history
- higher blast radius if repository access is shared

Priority:

- Critical

Required action:

- move `directUrl` to environment variables
- rotate the exposed credential
- audit whether the credential has already been reused elsewhere

## 2. Authorization and Data Access Debt

### 2.1 Authorization is service-driven, not centralized enough

Files:

- [auth.js](d:/งาน/AI%20Project/elearning-api/src/middleware/auth.js:1)
- [admin.service.js](d:/งาน/AI%20Project/elearning-api/src/services/admin.service.js:1)
- [user.service.js](d:/งาน/AI%20Project/elearning-api/src/services/user.service.js:1)

Finding:

- The app uses JWT middleware plus service-level role checks.
- This works, but policy logic is spread across middleware and services.

Risk:

- inconsistent access rules between endpoints
- harder audits for manager/admin/tier-based access
- higher chance of regressions when adding new endpoints

Priority:

- High

Required action:

- centralize authorization rules into shared helpers
- standardize actor resolution for `admin`, `manager`, `tier access`, and end-user scope
- add focused tests around permission boundaries

### 2.2 RLS is a future option, not the immediate remediation

Finding:

- The previous report proposed Supabase-style RLS policies using `auth.uid()`.
- That proposal does not align with the current backend request path.

Decision:

- Do not treat RLS as Wave 1 foundation work.
- Treat it as a future hardening track only after we deliberately choose a database-session auth propagation model.

Prerequisites before any RLS rollout:

- define how app identity maps to DB identity
- decide whether requests will execute with per-user context, role-based DB roles, or session variables
- prove Prisma and deployment flow can preserve that policy model safely

## 3. Frontend Maintainability Debt

### 3.1 Oversized high-maintenance files

Largest frontend files currently observed:

| File | Lines | Primary Risk |
| :--- | ---: | :--- |
| `src/pages/admin/CourseManagement.jsx` | 1084 | Mixed CRUD flows, filters, ordering, lesson actions, category actions |
| `src/pages/user/LessonPlayer.jsx` | 719 | Player logic + lesson flow + quiz submission + progress handling |
| `src/components/admin/CourseModal.jsx` | 604 | Large form state and UI branching |
| `src/pages/user/CourseDetail.jsx` | 585 | Heavy page orchestration and presentation logic coupling |
| `src/pages/user/Profile.jsx` | 484 | Multiple account actions and UI concerns in one file |
| `src/pages/admin/GoalManagement.jsx` | 471 | Dense table and admin workflow logic |
| `src/pages/admin/UserManagement.jsx` | 434 | CRUD + filters + modal orchestration |
| `src/pages/user/Home.jsx` | 418 | Hero, content grouping, temporary states, and presentation logic |
| `src/components/common/CustomDateTimePicker.jsx` | 404 | Complex UI state in shared control |
| `src/components/common/DocViewer.jsx` | 403 | Viewer behavior and display logic mixed together |

Risk:

- slower onboarding
- harder bug isolation
- higher merge conflict probability
- fragile edits because UI and side effects are co-located

Priority:

- High

Required action:

- split large files by responsibility
- extract hooks for data/action orchestration
- extract reusable presentational subcomponents where state boundaries are clear

## 4. Branding and Styling Debt

### 4.1 Incomplete theme centralization

Validated indicators:

- 228 matches of literal color family usage such as `amber`, `indigo`, `emerald`
- 164 matches of literal `rgba(...)` and hex color usage across frontend source

Reality check:

- the app already has partial tokenization in [index.css](d:/งาน/AI%20Project/elearning-webapp/src/index.css:1)
- the debt is not “no design system”
- the debt is “partial design system with many escape hatches”

Risk:

- one client rebrand still requires many manual edits
- gradients, glows, and translucent states remain stuck on old colors
- UI consistency degrades as more screens are added

Priority:

- High

Implementation owner document:

- [implementation_plan.md](d:/งาน/AI%20Project/implementation_plan.md)

Required action:

- use `implementation_plan.md` as the execution plan
- do not invent a second parallel branding roadmap here

## 5. UX Feedback Debt

### 5.1 `window.alert()` is still used widely

Validated indicator:

- 45 `alert(...)` usages remain in the frontend

Representative files:

- [CourseManagement.jsx](d:/งาน/AI%20Project/elearning-webapp/src/pages/admin/CourseManagement.jsx:200)
- [UserManagement.jsx](d:/งาน/AI%20Project/elearning-webapp/src/pages/admin/UserManagement.jsx:101)
- [Rewards.jsx](d:/งาน/AI%20Project/elearning-webapp/src/pages/user/Rewards.jsx:47)
- [Profile.jsx](d:/งาน/AI%20Project/elearning-webapp/src/pages/user/Profile.jsx:86)
- [LessonPlayer.jsx](d:/งาน/AI%20Project/elearning-webapp/src/pages/user/LessonPlayer.jsx:132)

Risk:

- inconsistent user feedback
- poor mobile UX
- difficult styling and localization
- hard to support queued or non-blocking notifications

Priority:

- Medium-High

Required action:

- introduce a notification abstraction such as `notify.success`, `notify.error`, `notify.info`
- swap direct alerts gradually starting with highest-traffic actions

## 6. Localization Debt

### 6.1 Thai copy is embedded directly in UI code

Validated indicator:

- 1077 Thai text matches in frontend `.js/.jsx` files

Risk:

- blocks multilingual rollout
- increases review noise when copy changes
- makes consistent terminology harder across admin and user surfaces

Priority:

- Medium

Required action:

- do not start with a full app-wide i18n migration immediately
- first define copy domains and extraction strategy
- then migrate shared labels and high-traffic screens

## 7. Date and Formatting Debt

### 7.1 Date utility adoption is partial, not absent

Reality check:

- [dateUtils.js](d:/งาน/AI%20Project/elearning-webapp/src/utils/dateUtils.js) exists and is already used by multiple screens
- the debt is not “missing date utility”
- the debt is “incomplete standardization”

Priority:

- Medium

Required action:

- audit remaining ad-hoc formatting
- standardize date/time rendering through `dateUtils.js`
- keep Thai/Buddhist date formatting centralized

## Corrected Priorities

The previous report mixed real debt with recommendations that were not aligned to the current stack. The corrected priority order should be:

1. Secret hygiene and credential rotation
2. Authorization hardening and permission centralization
3. Centralized brand CI rollout
4. Decomposition of oversized components
5. Notification infrastructure
6. Testing for permission, enrollment, progress, and formatting flows
7. Localization extraction

## Strategic Roadmap

## Wave 0 - Immediate Risk Reduction

### Goal

Remove critical exposure and prevent avoidable production risk.

### Tasks

- move Prisma `directUrl` out of source-controlled schema
- rotate exposed database credentials
- audit other config files for embedded secrets
- document environment variable contract

### Exit criteria

- no live credentials remain committed in tracked source files

## Wave 1 - Authorization Foundation

### Goal

Make access control easier to reason about and safer to extend.

### Tasks

- extract shared permission helpers for user, manager, admin, and tier-based admin access
- reduce duplicated scope logic in services
- add focused tests around admin-panel access and user data isolation
- document the current auth model clearly

### Exit criteria

- new endpoints can reuse one authorization model instead of re-implementing checks

## Wave 2 - Brand CI and Design System

### Goal

Centralize branding so the product can be re-skinned for clients with minimal code changes.

### Tasks

- execute [implementation_plan.md](d:/งาน/AI%20Project/implementation_plan.md)
- start with token contract and shared primitives
- then migrate high-impact user/admin screens

### Exit criteria

- changing theme tokens updates major user/admin surfaces without local color edits

## Wave 3 - Component Decomposition

### Goal

Lower the maintenance cost of the highest-risk files.

### Primary targets

- [CourseManagement.jsx](d:/งาน/AI%20Project/elearning-webapp/src/pages/admin/CourseManagement.jsx:1)
- [LessonPlayer.jsx](d:/งาน/AI%20Project/elearning-webapp/src/pages/user/LessonPlayer.jsx:1)
- [CourseModal.jsx](d:/งาน/AI%20Project/elearning-webapp/src/components/admin/CourseModal.jsx:1)
- [CourseDetail.jsx](d:/งาน/AI%20Project/elearning-webapp/src/pages/user/CourseDetail.jsx:1)

### Tasks

- split data/action logic into custom hooks
- split repeated UI into focused subcomponents
- reduce prop drilling by tightening boundaries
- make files smaller without changing product behavior

### Exit criteria

- critical components become easier to test, review, and extend

## Wave 4 - Feedback and Interaction Infrastructure

### Goal

Replace blocking feedback patterns with a system-level notification approach.

### Tasks

- add notification utility
- replace `alert(...)` in high-frequency user flows first
- standardize success, error, warning, and loading messaging

### Exit criteria

- no critical user flow depends on browser-native alerts

## Wave 5 - Regression Defense

### Goal

Stop core bugs from recurring.

### Minimum useful test coverage

- auth and permission checks
- course enrollment flow
- lesson progress and quiz submission
- reward redemption rules
- date formatting utilities

### Exit criteria

- the most expensive regressions are covered by automated checks

## Wave 6 - Localization Readiness

### Goal

Reduce the cost of future multi-language support.

### Tasks

- define translation file structure
- extract shared/common UI copy first
- migrate high-traffic user/admin surfaces incrementally

### Exit criteria

- new screens follow a documented copy strategy instead of embedding literals by default

## Success Metrics

### Security

- 0 live credentials committed in tracked source
- permission-sensitive endpoints covered by authorization tests

### Maintainability

- top 5 high-risk files reduced in size or split by responsibility
- fewer emergency edits inside monolithic components

### Branding

- brand token changes can update major surfaces within minutes
- no major user/admin CTA remains stuck on legacy hardcoded colors

### UX

- `alert(...)` usage reduced to 0 in primary user and admin flows

### Product readiness

- localization can begin without redesigning the architecture

## Implementation Notes

### About RLS

RLS is not rejected forever. It is simply not the first move for this codebase in its current shape. If we revisit it later, it should be done as a dedicated security architecture project, not as a casual SQL add-on.

### About theming

The brand-system work already has a much stronger plan in [implementation_plan.md](d:/งาน/AI%20Project/implementation_plan.md). This report should track its priority, not duplicate its execution detail.

### About this document

This file should remain:

- evidence-based
- stack-aware
- short enough to guide prioritization
- detailed enough to justify why a wave exists

---

Updated on 2026-04-10
