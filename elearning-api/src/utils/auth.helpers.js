const ADMIN_PANEL_ROLES = ['admin', 'manager'];
const MANAGED_USER_ROLES = ['user', 'manager'];

const isExpiredAt = (value, referenceDate = new Date()) => {
    if (!value) {
        return false;
    }

    const expiryDate = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(expiryDate.getTime())) {
        return false;
    }

    return expiryDate <= referenceDate;
};

const buildTimedVisibilityWhere = ({
    referenceDate = new Date(),
    expiresAtField = 'expiredAt',
    temporaryFlagField = 'isTemporary'
} = {}) => {
    const visibleTimeClauses = [
        { [expiresAtField]: null },
        { [expiresAtField]: { gt: referenceDate } }
    ];

    if (!temporaryFlagField) {
        return {
            OR: visibleTimeClauses
        };
    }

    return {
        OR: [
            { [temporaryFlagField]: false },
            ...visibleTimeClauses
        ]
    };
};

const isTimedEntityExpired = (
    entity,
    { referenceDate = new Date(), expiresAtField = 'expiredAt', temporaryFlagField = 'isTemporary' } = {}
) => {
    if (!entity) {
        return false;
    }

    if (temporaryFlagField && entity[temporaryFlagField] === false) {
        return false;
    }

    return isExpiredAt(entity[expiresAtField], referenceDate);
};

/**
 * Standardizes the user record into a clean object with consistent field names.
 * Used for mapping Prisma results to the format expected by the frontend/logic.
 */
const mapUserRecord = (user) => {
    if (!user) return null;
    const { departmentRef, tier, ...rest } = user;

    return {
        ...rest,
        departmentId: departmentRef?.id || rest.departmentId || null,
        department: departmentRef?.name || rest.department || null,
        tierId: tier?.id || rest.tierId || null,
        tier: tier ? {
            id: tier.id,
            name: tier.name,
            accessAdmin: tier.accessAdmin,
            order: tier.order
        } : null,
        employmentDate: rest.employmentDate || rest.createdAt
    };
};

/**
 * Resolves the calling user's effective role and scope.
 * Handles tier-based admin access (e.g. Director tier granting panel access).
 */
const getActorContext = async (prisma, authUser) => {
    if (!authUser?.userId) {
        throw new Error('Authentication required');
    }

    const actor = await prisma.user.findUnique({
        where: { id: authUser.userId },
        include: {
            departmentRef: true,
            tier: true
        }
    });

    if (!actor) {
        throw new Error('User not found');
    }

    // Role resolution: Admin is always Admin. 
    // Manager stays Manager. 
    // User can become effective Manager if their Tier has accessAdmin: true.
    const effectiveRole = actor.role === 'admin'
        ? 'admin'
        : (actor.role === 'manager' || actor.tier?.accessAdmin)
            ? 'manager'
            : 'user';

    const mappedActor = {
        ...mapUserRecord(actor),
        effectiveRole,
        isAdmin: effectiveRole === 'admin',
        isManager: effectiveRole === 'manager',
        canAccessAdminPanel: ADMIN_PANEL_ROLES.includes(effectiveRole)
    };

    // Strict validation for managers
    if (mappedActor.isManager && !mappedActor.departmentId) {
        throw new Error('Manager account must belong to a department to determine scope');
    }

    return mappedActor;
};

/**
 * Builds a Prisma 'where' clause for user management.
 * Admins can manage users and managers.
 * Managers can only manage users in their department.
 */
const buildUserManagementWhere = (actor, extraWhere = {}) => {
    if (actor.isAdmin) {
        return {
            role: { in: MANAGED_USER_ROLES },
            ...extraWhere
        };
    }

    if (actor.isManager) {
        return {
            role: 'user',
            departmentId: actor.departmentId,
            ...extraWhere
        };
    }

    throw new Error('Unauthorized to manage users');
};

/**
 * Builds a Prisma 'where' clause for Course/Category visibility.
 * Admins see everything (all statuses).
 * End users (and managers) see only PUBLISHED and within scope.
 */
const buildVisibilityWhere = (actor, { status = 'PUBLISHED', referenceDate = new Date() } = {}) => {
    // Admin override: See everything regardless of scope or temporary status
    if (actor.isAdmin) {
        return {};
    }

    // Temporary items visibility logic
    const temporaryWhere = buildTimedVisibilityWhere({ referenceDate });

    const departmentConditions = [{ departmentAccess: { none: {} } }];
    if (actor.departmentId) {
        departmentConditions.push({
            departmentAccess: {
                some: {
                    departmentId: actor.departmentId
                }
            }
        });
    }

    return {
        AND: [
            status ? { status } : {},
            temporaryWhere,
            {
                OR: [
                    { visibleToAll: true },
                    {
                        visibleToAll: false,
                        AND: [{ OR: departmentConditions }]
                    }
                ]
            }
        ]
    };
};

/**
 * Granular check for single entity access.
 * Handles Tier hierarchy logic (higher rank users see lower rank required content).
 */
const canAccessEntity = (actor, entity, referenceDate = new Date()) => {
    if (!entity) return true;
    if (actor.isAdmin) return true;

    // 1. Temporary status check
    if (isTimedEntityExpired(entity, { referenceDate })) {
        return false;
    }

    // 2. Draft check for non-admins
    if (entity.status && entity.status !== 'PUBLISHED') {
        return false;
    }

    if (entity.visibleToAll) {
        return true;
    }

    // 3. Department check
    const departmentAccess = entity.departmentAccess || [];
    const hasDeptAccess = departmentAccess.length === 0 || 
                         (actor.departmentId && departmentAccess.some(d => d.departmentId === actor.departmentId));
    
    if (!hasDeptAccess) return false;

    // 4. Tier hierarchy check
    const tierAccess = entity.tierAccess || [];
    if (tierAccess.length === 0) return true;

    const actorTierOrder = actor.tier?.order ?? 999;
    const requiredOrders = tierAccess
        .map(t => t.tier?.order)
        .filter(o => o !== undefined && o !== null);

    if (requiredOrders.length === 0) return true;

    // User rank (lower order) must be <= highest required rank (highest order value enabled)
    // Example: Content for Officer (Order 10). Manager (Order 2) can see it because 2 <= 10.
    return actorTierOrder <= Math.max(...requiredOrders);
};

const buildGoalVisibilityWhere = (
    actor,
    { referenceDate = new Date(), includeExpired = false, includeAllScopes = false } = {}
) => {
    const filters = [{ status: 'ACTIVE' }];

    if (!includeExpired) {
        filters.push(buildTimedVisibilityWhere({
            referenceDate,
            expiresAtField: 'expiryDate',
            temporaryFlagField: null
        }));
    }

    if (!(includeAllScopes && actor.isAdmin)) {
        const scopeClauses = [{ scope: 'GLOBAL' }];

        if (actor.departmentId) {
            scopeClauses.push({
                scope: 'DEPARTMENT',
                departmentId: actor.departmentId
            });
        }

        filters.push({
            OR: scopeClauses
        });
    }

    return filters.length === 1 ? filters[0] : { AND: filters };
};

const canAccessGoal = (
    actor,
    goal,
    { referenceDate = new Date(), includeExpired = false, includeAllScopes = false } = {}
) => {
    if (!goal || goal.status !== 'ACTIVE') {
        return false;
    }

    if (!includeExpired && isTimedEntityExpired(goal, {
        referenceDate,
        expiresAtField: 'expiryDate',
        temporaryFlagField: null
    })) {
        return false;
    }

    if (!(includeAllScopes && actor.isAdmin) && goal.scope === 'DEPARTMENT' && goal.departmentId !== actor.departmentId) {
        return false;
    }

    return true;
};

module.exports = {
    getActorContext,
    mapUserRecord,
    buildUserManagementWhere,
    buildVisibilityWhere,
    canAccessEntity,
    buildGoalVisibilityWhere,
    canAccessGoal,
    buildTimedVisibilityWhere,
    isExpiredAt,
    isTimedEntityExpired,
    ADMIN_PANEL_ROLES,
    MANAGED_USER_ROLES
};
