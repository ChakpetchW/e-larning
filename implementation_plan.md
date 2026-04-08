# Implementation Plan - Hierarchical Course Visibility

The system currently uses a hardcoded tier rank map which is out of sync with the recent "User Tier Ordering" feature. This causes visibility issues where higher-ranking users cannot see courses meant for lower-ranking tiers (e.g., Managers cannot see Officer courses).

## User Review Required

> [!IMPORTANT]
> The hierarchy logic will be updated to: **A user can see any course assigned to their own tier OR any tier with a higher 'order' value (meaning it ranks lower in the organizational hierarchy).**
> 
> Current Hierarchy confirmed by user:
> 1. Manager (Order 0) - Highest
> 2. Supervisor (Order 1)
> 3. Officer (Order 2) - Lowest
>
> Logic: `User.Tier.order <= Course.Tier.order`

## Proposed Changes

### Backend Service (elearning-api)

#### [MODIFY] [user.service.js](file:///d:/งาน/AI Project/elearning-api/src/services/user.service.js)
- Update `getUserVisibilityContext` to select the `order` field from the `Tier` model.
- Remove the hardcoded `TIER_RANK_MAP` and `getTierRank` function.
- Update `canAccessByTierHierarchy` to compare `userContext.tier.order` with `courseTier.order`.
- Ensure that if multiple tiers are assigned to a course, the user can access it if their tier ranks higher than or equal to the *highest-ranking* (lowest order value) tier required by the course (which means it matches at least one, or encompasses it).
    - Logic: `User.order <= Math.max(...RequiredTiers.orders)`. If a course is specifically for Officers (Order 2), a Manager (Order 0) can see it because `0 <= 2`.

### Admin Service (elearning-api)

#### [MODIFY] [admin.service.js](file:///d:/งาน/AI Project/elearning-api/src/services/admin.service.js)
- Ensure consistency in any internal visibility checks used by admin stats if applicable.

## Verification Plan

### Manual Verification
1. Log in as a **Manager** (Tier Order 0).
2. Create/Assign a course to the **Officer** Tier (Tier Order 2).
3. Verify the **Manager** can see the **Officer** course in the course list.
4. Log in as an **Officer**.
5. Verify the **Officer** CANNOT see the **Manager** course.
6. Verify the **Officer** CAN see their own **Officer** course.
