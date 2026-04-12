---
name: architecture-pro-hygiene
description: Master Guide for production-grade architectural standards, sustainable component decomposition, strict type safety, and secure, centralized logic patterns.
---

# 🛡️ Architecture Pro Hygiene Master Guide

This skill is the definitive source of truth for maintaining the architectural integrity of the e-learning platform. All AI assistants must adhere to these standards to ensure zero technical debt accumulation and a premium user experience.

---

## 1. 🏗️ Component Sustainability & Clean Code

Files exceeding 400 lines are considered "Architectural Debt". 

### ✅ The Modular Pattern:
When a component grows, decompose it according to this hierarchy:
1.  **Container/Page**: Orchestrates data fetching, high-level state, and passes props down.
2.  **Custom Hooks**: Isolate side effects, complex form logic, and API calls (e.g., `useCourseActions.ts`).
3.  **Sub-components**: Pure presentational UI modules.

### ❌ Anti-Patterns to Avoid:
- Inlining massive `useEffect` or `useMemo` blocks inside a large component.
- Mixing Admin-only UI and User-facing UI in the same file.
- Direct API calls inside the `render` block (all calls must go through a Service layer or data fetching library).
- Using `any` in TypeScript. Always define explicit interfaces or types.

---

## 2. 🔐 Centralized Authorization, Security & Validation

Security must be **Declarative**, **Centralized**, and **Validated**.

### ✅ Backend Service Pattern:
Every service method must validate inputs via a schema (e.g., Zod) and resolve the "Actor" first.

```typescript
/* Standard Service Template */
import { z } from 'zod';

const updateCourseSchema = z.object({ status: z.string() });

export const executeAction = async (payload: any, authUser: UserContext) => {
    // 1. Input Validation
    const data = updateCourseSchema.parse(payload);

    // 2. Resolve Context (Always use authHelpers)
    const actor = await authHelpers.getActorContext(prisma, authUser);
    
    // 3. Build Scoped Where Clause
    const where = authHelpers.buildVisibilityWhere(actor, { status: data.status });
    
    // 4. Execute Scoped Query
    const results = await prisma.entity.findMany({ where });
    
    // 5. Granular Access Check (Filter results for Tier hierarchy)
    return results.filter(item => authHelpers.canAccessEntity(actor, item));
};
```

### ❌ Anti-Patterns to Avoid:
- Trusts client payloads without Zod/Yup validation.
- Catching errors locally and returning successful 200 responses with error messages (Always throw a proper Error context).
- Manually checking `if (user.role === 'admin')` inside endpoints.
- Fetching user records from Prisma multiple times in one request path.

---

## 3. 🎨 Premium UX Feedback & Modern UI Standards

Maintaining a "Premium, Futuristic, and Elegant" feel requires high-performance interaction patterns.

### ✅ User Interaction Pattern:
- **Notifications**: Always use `useToast()` -> `toast.success()`, `toast.error()`.
- **Confirmations**: Always use `useConfirm()` -> `const ok = await confirm({ title: 'Danger', variant: 'danger' })`.
- **Loading States**: Prefer Skeleton Loaders over blocky loading spinners to avoid layout shifts.
- **Styling**: Always use semantic tokens (e.g., `text-primary-500`, `bg-dark-900`) to ensure seamless Dark Mode support. Utilize `backdrop-blur-md` for floating elements (modals/navbars) to maintain an elegant depth.

### ❌ Anti-Patterns to Avoid:
- Using `window.alert()` or `window.confirm()`.
- Hardcoding hex colors (e.g., `#FF0000`).
- Abrupt UI changes without smooth transitions.

---

## 4. 🌐 Native-First Localization (i18n)

The project is designed for multilingual support. Zero hardcoded display literals should exist in JSX.

### ✅ Localization Rules:
1.  **Define Key**: `admin.user_management.delete_confirm`
2.  **Update Locale**: Add to `src/locales/th.json` and ensure a fallback in `en.json`.
3.  **Use Hook**:
    ```tsx
    const { t } = useTranslation();
    return <h1>{t('admin.dashboard.title')}</h1>;
    ```

---

## 5. 📅 Date & Formatting Standardization

Global standard for Thai Buddhist Era (B.E.) and generic formatting.

### ✅ Standard Usage:
- **Display Date**: `formatDisplayDate(date)`
- **Full Date/Time**: `formatFullDateTime(date)`
- **Thai Year**: Always ensure `toThaiYear` is used for B.E. displays in Thai context.

---

## 6. 🔌 Database Hygiene (Prisma)

Prevent connection leaks, credential exposure, and performance bottlenecks.

### ✅ Environment & Query Contract:
- `DATABASE_URL`: Port **6543** (PgBouncer/Pooling) - for runtime serverless calls.
- `DIRECT_URL`: Port **5432** (Direct) - for migrations and build-time schema checks.
- **Performance**: Always be mindful of **N+1 query problems**. Use `include` or `select` judiciously to fetch relations in a single query.

### ❌ Anti-Patterns to Avoid:
- Committing the `.env` file.
- Running `prisma db push` in production; always use the CI/CD pipeline (`prisma migrate deploy`).
- Over-fetching fields (e.g., `select: { password: true }` in public maps).

---

## 7. 🚦 Final Project Rules Checklist

Before submitting any code change, verify:
- [ ] File size is < 400 lines (Component properly decomposed).
- [ ] No TypeScript warnings (`any` types resolved).
- [ ] Input data is validated (Zod/Schema).
- [ ] Logic uses `auth.helpers.ts` for permissions.
- [ ] Error handling is consistent (Thrown Errors match Middleware expectations).
- [ ] New strings are in `th.json` and `en.json`.
- [ ] `window.alert/confirm` are replaced with custom hooks.
- [ ] Prisma queries are optimized (No N+1 loops).

---
*Maintained by Antigravity v1.7.0*