const prisma = require('../utils/prisma');

const createGoal = async (data, authUser) => {
    const { title, type, targetCount, expiryDate, scope, departmentId, courseIds } = data;
    
    // Validate scope
    let finalScope = scope || 'GLOBAL';
    let finalDeptId = departmentId || null;

    if (authUser.role === 'manager') {
        const user = await prisma.user.findUnique({
            where: { id: authUser.userId },
            select: { departmentId: true }
        });
        finalScope = 'DEPARTMENT';
        finalDeptId = user.departmentId;
    }

    return await prisma.$transaction(async (tx) => {
        const goal = await tx.learningGoal.create({
            data: {
                title,
                type,
                targetCount: type === 'ANY' ? parseInt(targetCount) : (courseIds?.length || 1),
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                scope: finalScope,
                departmentId: finalDeptId,
                status: 'ACTIVE'
            }
        });

        if (type === 'SPECIFIC' && courseIds && courseIds.length > 0) {
            await tx.goalCourse.createMany({
                data: courseIds.map(courseId => ({
                    goalId: goal.id,
                    courseId
                }))
            });
        }

        return goal;
    });
};

const getGoals = async (authUser) => {
    let where = { status: 'ACTIVE' };

    if (authUser.role === 'manager' || authUser.role === 'user') {
        const user = await prisma.user.findUnique({
            where: { id: authUser.userId },
            select: { departmentId: true }
        });
        
        // Managers and users see their department's goals AND global goals
        where = {
            OR: [
                { scope: 'GLOBAL' },
                { AND: [{ scope: 'DEPARTMENT' }, { departmentId: user?.departmentId || null }] }
            ],
            status: 'ACTIVE'
        };
    }

    return await prisma.learningGoal.findMany({
        where,
        include: {
            courses: {
                include: {
                    course: {
                        select: { id: true, title: true }
                    }
                }
            },
            department: {
                select: { name: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
};

const deleteGoal = async (id, authUser) => {
    const goal = await prisma.learningGoal.findUnique({ where: { id } });
    if (!goal) throw new Error('Goal not found');

    if (authUser.role === 'manager' && goal.departmentId !== authUser.departmentId) {
        throw new Error('Not authorized to delete this goal');
    }

    return await prisma.learningGoal.update({
        where: { id },
        data: { status: 'ARCHIVED' }
    });
};

const getGoalReport = async (goalId, authUser) => {
    const goal = await prisma.learningGoal.findUnique({
        where: { id: goalId },
        include: {
            courses: true
        }
    });

    if (!goal) throw new Error('Goal not found');

    // Get users in scope
    let userWhere = { status: 'ACTIVE' };
    if (goal.scope === 'DEPARTMENT') {
        userWhere.departmentId = goal.departmentId;
    }

    const users = await prisma.user.findMany({
        where: userWhere,
        select: {
            id: true,
            name: true,
            email: true,
            departmentRef: { select: { name: true } }
        }
    });

    const report = [];
    const windowStart = goal.createdAt;
    const windowEnd = goal.expiryDate || new Date();

    for (const user of users) {
        let completions = [];
        if (goal.type === 'ANY') {
            completions = await prisma.userCourse.findMany({
                where: {
                    userId: user.id,
                    status: 'COMPLETED',
                    completedAt: {
                        gte: windowStart,
                        lte: windowEnd
                    }
                }
            });
        } else {
            const courseIds = goal.courses.map(gc => gc.courseId);
            completions = await prisma.userCourse.findMany({
                where: {
                    userId: user.id,
                    courseId: { in: courseIds },
                    status: 'COMPLETED',
                    completedAt: {
                        gte: windowStart,
                        lte: windowEnd
                    }
                }
            });
        }

        const isSuccess = completions.length >= goal.targetCount;
        report.push({
            userId: user.id,
            name: user.name,
            email: user.email,
            department: user.departmentRef?.name || '-',
            completionCount: completions.length,
            targetCount: goal.targetCount,
            isSuccess,
            completions: completions.map(c => ({
                id: c.id,
                completedAt: c.completedAt
            }))
        });
    }

    return {
        goal,
        report
    };
};

module.exports = {
    createGoal,
    getGoals,
    deleteGoal,
    getGoalReport
};
