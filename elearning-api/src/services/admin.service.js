const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');

const courseInclude = {
    category: true,
    departmentAccess: {
        include: {
            department: true
        }
    },
    tierAccess: {
        include: {
            tier: true
        }
    },
    _count: {
        select: {
            enrollments: true,
            lessons: true
        }
    }
};

const userInclude = {
    departmentRef: true,
    tier: true,
    _count: {
        select: {
            enrollments: {
                where: {
                    status: 'COMPLETED'
                }
            }
        }
    }
};

const parseInteger = (value, fallback = 0) => {
    if (value === undefined || value === null || value === '') {
        return fallback;
    }

    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
};

const parseFloatValue = (value, fallback = undefined) => {
    if (value === undefined || value === null || value === '') {
        return fallback;
    }

    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? fallback : parsed;
};

const normalizeNullableId = (value) => {
    if (value === undefined) {
        return undefined;
    }

    if (value === null || value === '') {
        return null;
    }

    return String(value);
};

const normalizeIdArray = (values) => {
    if (!Array.isArray(values)) {
        return [];
    }

    return [...new Set(
        values
            .filter(Boolean)
            .map((value) => String(value))
    )];
};

const sanitizeName = (value, entityLabel) => {
    const name = String(value || '').trim();

    if (!name) {
        throw new Error(`${entityLabel} name is required`);
    }

    return name;
};

const mapUserRecord = (user) => {
    const { departmentRef, tier, ...rest } = user;

    return {
        ...rest,
        departmentId: departmentRef?.id || rest.departmentId || null,
        department: departmentRef?.name || rest.department || null,
        tierId: tier?.id || rest.tierId || null,
        tier: tier?.name || null,
        employmentDate: rest.employmentDate || rest.createdAt
    };
};

const mapCourseRecord = (course) => {
    const { departmentAccess, tierAccess, ...rest } = course;
    const visibleDepartments = departmentAccess?.map((item) => item.department) || [];
    const visibleTiers = tierAccess?.map((item) => item.tier) || [];

    return {
        ...rest,
        visibleDepartments,
        visibleDepartmentIds: visibleDepartments.map((department) => department.id),
        visibleTiers,
        visibleTierIds: visibleTiers.map((tier) => tier.id)
    };
};

const ensureReferenceName = async (tx, modelName, id) => {
    if (!id) {
        return null;
    }

    const entity = await tx[modelName].findUnique({
        where: { id },
        select: { id: true, name: true }
    });

    if (!entity) {
        throw new Error(`${modelName} not found`);
    }

    return entity;
};

const ensureReferenceIdsExist = async (tx, modelName, ids) => {
    if (!ids.length) {
        return;
    }

    const count = await tx[modelName].count({
        where: {
            id: {
                in: ids
            }
        }
    });

    if (count !== ids.length) {
        throw new Error(`Invalid ${modelName} selection`);
    }
};

const buildUserMutationData = async (tx, inputData, { isCreate = false } = {}) => {
    const data = {};
    const { password, pointsBalance, ...baseData } = inputData;

    if (baseData.name !== undefined) {
        data.name = baseData.name;
    }

    if (baseData.email !== undefined) {
        data.email = baseData.email;
    }

    if (baseData.role !== undefined) {
        data.role = baseData.role;
    }

    if (password) {
        data.password = await bcrypt.hash(password, 10);
    } else if (isCreate) {
        data.password = await bcrypt.hash('password123', 10);
    }

    if (pointsBalance !== undefined) {
        data.pointsBalance = parseInteger(pointsBalance, 0);
    } else if (isCreate) {
        data.pointsBalance = 0;
    }

    const departmentId = normalizeNullableId(baseData.departmentId);
    if (departmentId !== undefined) {
        const department = await ensureReferenceName(tx, 'department', departmentId);
        data.departmentId = department?.id || null;
        data.department = department?.name || null;
    } else if (baseData.department !== undefined && !isCreate) {
        data.department = baseData.department || null;
    }

    const tierId = normalizeNullableId(baseData.tierId);
    if (tierId !== undefined) {
        const tier = await ensureReferenceName(tx, 'tier', tierId);
        data.tierId = tier?.id || null;
    }

    if (baseData.employmentDate !== undefined) {
        data.employmentDate = baseData.employmentDate ? new Date(baseData.employmentDate) : null;
    } else if (isCreate) {
        data.employmentDate = new Date();
    }

    return data;
};

const buildCourseMutationPayload = async (tx, input) => {
    const visibleDepartmentIds = normalizeIdArray(input.visibleDepartmentIds);
    const visibleTierIds = normalizeIdArray(input.visibleTierIds);

    await Promise.all([
        ensureReferenceIdsExist(tx, 'department', visibleDepartmentIds),
        ensureReferenceIdsExist(tx, 'tier', visibleTierIds)
    ]);

    const data = {
        title: input.title,
        description: input.description || null,
        categoryId: input.categoryId || null,
        points: parseInteger(input.points, 0),
        status: input.status || undefined,
        image: input.image || null,
        visibleToAll: input.visibleToAll !== undefined ? Boolean(input.visibleToAll) : true,
        instructorName: input.instructorName || null,
        instructorRole: input.instructorRole || null,
        instructorAvatar: input.instructorAvatar || null,
        instructorBio: input.instructorBio || null,
        previewVideoUrl: input.previewVideoUrl || null,
        totalDuration: input.totalDuration || null,
        whatYouWillLearn: input.whatYouWillLearn || null,
        whatYouWillGet: input.whatYouWillGet || null,
        rating: parseFloatValue(input.rating, 4.8),
        reviewCount: parseInteger(input.reviewCount, 1240),
        studentCount: parseInteger(input.studentCount, 5000)
    };

    return {
        data,
        visibleDepartmentIds,
        visibleTierIds
    };
};

const saveCourseVisibility = async (tx, courseId, visibleToAll, visibleDepartmentIds, visibleTierIds) => {
    await tx.courseDepartmentAccess.deleteMany({ where: { courseId } });
    await tx.courseTierAccess.deleteMany({ where: { courseId } });

    if (visibleToAll) {
        return;
    }

    if (visibleDepartmentIds.length > 0) {
        await tx.courseDepartmentAccess.createMany({
            data: visibleDepartmentIds.map((departmentId) => ({
                courseId,
                departmentId
            }))
        });
    }

    if (visibleTierIds.length > 0) {
        await tx.courseTierAccess.createMany({
            data: visibleTierIds.map((tierId) => ({
                courseId,
                tierId
            }))
        });
    }
};

// DASHBOARD
const getDashboardStats = async () => {
    const [totalUsers, activeCourses, totalEnrollments, categories] = await Promise.all([
        prisma.user.count({ where: { role: 'user' } }),
        prisma.course.count({ where: { status: 'PUBLISHED' } }),
        prisma.userCourse.count(),
        prisma.category.findMany({ include: { _count: { select: { courses: true } } } })
    ]);

    const popularCoursesRaw = await prisma.course.findMany({
        include: { _count: { select: { enrollments: true } } },
        orderBy: { enrollments: { _count: 'desc' } },
        take: 5
    });

    const popularCourses = popularCoursesRaw.map((course) => ({
        id: course.id,
        title: course.title,
        students: course._count.enrollments,
        completionRate: '85%'
    }));

    const weeklyActivity = [];
    for (let index = 6; index >= 0; index -= 1) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - index);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1);

        const count = await prisma.userCourse.count({
            where: {
                startedAt: {
                    gte: startDate,
                    lt: endDate
                }
            }
        });

        weeklyActivity.push({
            date: startDate.toLocaleDateString('th-TH', { weekday: 'short' }),
            count
        });
    }

    return {
        totalUsers,
        activeCourses,
        totalEnrollments,
        popularCourses,
        weeklyActivity,
        categoryDistribution: categories.map((category) => ({
            name: category.name,
            value: category._count.courses
        }))
    };
};

// USERS
const getUsers = async () => {
    const users = await prisma.user.findMany({
        where: { role: 'user' },
        include: userInclude,
        orderBy: { pointsBalance: 'desc' }
    });

    return users.map(mapUserRecord);
};

const getUserDetails = async (id) => {
    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            departmentRef: true,
            tier: true,
            enrollments: {
                include: {
                    course: {
                        include: {
                            category: true
                        }
                    }
                },
                orderBy: { startedAt: 'desc' }
            },
            _count: {
                select: {
                    enrollments: true
                }
            }
        }
    });

    if (!user) {
        throw new Error('User not found');
    }

    const mappedUser = mapUserRecord(user);

    return {
        ...mappedUser,
        enrollments: user.enrollments.map((enrollment) => ({
            id: enrollment.id,
            status: enrollment.status,
            progressPercent: enrollment.progressPercent,
            startedAt: enrollment.startedAt,
            completedAt: enrollment.completedAt,
            course: {
                id: enrollment.course.id,
                title: enrollment.course.title,
                categoryName: enrollment.course.category?.name || null,
                points: enrollment.course.points
            }
        }))
    };
};

const createUser = async (inputData) => {
    return prisma.$transaction(async (tx) => {
        const data = await buildUserMutationData(tx, inputData, { isCreate: true });

        const user = await tx.user.create({
            data: {
                ...data,
                role: inputData.role || 'user'
            },
            include: {
                departmentRef: true,
                tier: true
            }
        });

        if ((data.pointsBalance || 0) > 0) {
            await tx.pointsLedger.create({
                data: {
                    userId: user.id,
                    sourceType: 'admin_edit',
                    points: data.pointsBalance,
                    note: 'Initial balance set during user creation'
                }
            });
        }

        return mapUserRecord(user);
    });
};

const updateUser = async (id, inputData) => {
    return prisma.$transaction(async (tx) => {
        const data = await buildUserMutationData(tx, inputData);

        if (inputData.pointsBalance !== undefined) {
            const targetBalance = parseInteger(inputData.pointsBalance, 0);
            const ledgerEntries = await tx.pointsLedger.findMany({
                where: { userId: id }
            });
            const currentBalance = ledgerEntries.reduce((sum, entry) => sum + entry.points, 0);
            const difference = targetBalance - currentBalance;

            if (difference !== 0) {
                await tx.pointsLedger.create({
                    data: {
                        userId: id,
                        sourceType: 'admin_edit',
                        points: difference,
                        note: `Admin adjusted balance by ${difference} (Target: ${targetBalance})`
                    }
                });
            }
        }

        const user = await tx.user.update({
            where: { id },
            data,
            include: {
                departmentRef: true,
                tier: true
            }
        });

        return mapUserRecord(user);
    });
};

const deleteUser = async (id) => prisma.user.delete({ where: { id } });

// DEPARTMENTS
const getDepartments = async () => prisma.department.findMany({
    orderBy: { name: 'asc' }
});

const createDepartment = async (data) => prisma.department.create({
    data: {
        name: sanitizeName(data.name, 'Department')
    }
});

const updateDepartment = async (id, data) => prisma.department.update({
    where: { id },
    data: {
        name: sanitizeName(data.name, 'Department')
    }
});

const deleteDepartment = async (id) => prisma.department.delete({
    where: { id }
});

// TIERS
const getTiers = async () => prisma.tier.findMany({
    orderBy: { name: 'asc' }
});

const createTier = async (data) => prisma.tier.create({
    data: {
        name: sanitizeName(data.name, 'Tier')
    }
});

const updateTier = async (id, data) => prisma.tier.update({
    where: { id },
    data: {
        name: sanitizeName(data.name, 'Tier')
    }
});

const deleteTier = async (id) => prisma.tier.delete({
    where: { id }
});

// COURSES
const getAdminCourses = async () => {
    const courses = await prisma.course.findMany({
        include: courseInclude,
        orderBy: { createdAt: 'desc' }
    });

    return courses.map(mapCourseRecord);
};

const createCourse = async (input) => prisma.$transaction(async (tx) => {
    const { data, visibleDepartmentIds, visibleTierIds } = await buildCourseMutationPayload(tx, input);

    const course = await tx.course.create({
        data
    });

    await saveCourseVisibility(tx, course.id, data.visibleToAll, visibleDepartmentIds, visibleTierIds);

    const createdCourse = await tx.course.findUnique({
        where: { id: course.id },
        include: courseInclude
    });

    return mapCourseRecord(createdCourse);
});

const updateCourse = async (id, input) => prisma.$transaction(async (tx) => {
    const { data, visibleDepartmentIds, visibleTierIds } = await buildCourseMutationPayload(tx, input);

    await tx.course.update({
        where: { id },
        data
    });

    await saveCourseVisibility(tx, id, data.visibleToAll, visibleDepartmentIds, visibleTierIds);

    const updatedCourse = await tx.course.findUnique({
        where: { id },
        include: courseInclude
    });

    return mapCourseRecord(updatedCourse);
});

const deleteCourse = async (id) => prisma.course.delete({ where: { id } });

// CATEGORIES
const getCategories = async () => prisma.category.findMany({
    orderBy: { order: 'asc' }
});

const createCategory = async (data) => prisma.category.create({ data });

const updateCategory = async (id, data) => prisma.category.update({
    where: { id },
    data: {
        name: data.name,
        order: data.order
    }
});

const deleteCategory = async (id) => prisma.category.delete({
    where: { id }
});

const reorderCategories = async (categoryIds) => prisma.$transaction(
    categoryIds.map((id, index) => prisma.category.update({
        where: { id },
        data: { order: index }
    }))
);

// REWARDS
const getAdminRewards = async () => prisma.reward.findMany({
    orderBy: { createdAt: 'desc' }
});

const createReward = async (data) => prisma.reward.create({
    data: {
        ...data,
        pointsCost: parseInteger(data.pointsCost, 0),
        stock: parseInteger(data.stock, 0),
        maxPerUser: parseInteger(data.maxPerUser, 1)
    }
});

const updateReward = async (id, data) => {
    const updateData = { ...data };

    if (updateData.maxPerUser !== undefined) {
        updateData.maxPerUser = parseInteger(updateData.maxPerUser, 1);
    }

    if (updateData.pointsCost !== undefined) {
        updateData.pointsCost = parseInteger(updateData.pointsCost, 0);
    }

    if (updateData.stock !== undefined) {
        updateData.stock = parseInteger(updateData.stock, 0);
    }

    return prisma.reward.update({
        where: { id },
        data: updateData
    });
};

const deleteReward = async (id) => prisma.reward.delete({
    where: { id }
});

// REDEMPTIONS
const getRedeemRequests = async () => prisma.redeemRequest.findMany({
    include: {
        user: {
            select: {
                name: true,
                email: true
            }
        },
        reward: true
    },
    orderBy: { requestedAt: 'desc' }
});

const updateRedeemStatus = async (id, status, adminNote) => {
    const request = await prisma.redeemRequest.findUnique({ where: { id } });
    if (!request) {
        throw new Error('Request not found');
    }

    return prisma.$transaction(async (tx) => {
        if (status === 'REJECTED' && request.status !== 'REJECTED') {
            await tx.pointsLedger.create({
                data: {
                    userId: request.userId,
                    sourceType: 'reward_adjust',
                    sourceId: request.id,
                    points: request.pointsCost,
                    note: `Refund for rejected redeem: ${id}`
                }
            });

            await tx.reward.update({
                where: { id: request.rewardId },
                data: {
                    stock: {
                        increment: 1
                    }
                }
            });
        }

        return tx.redeemRequest.update({
            where: { id },
            data: {
                status,
                adminNote,
                updatedAt: new Date()
            }
        });
    });
};

// LESSONS
const getCourseLessons = async (courseId) => prisma.lesson.findMany({
    where: { courseId },
    include: {
        questions: {
            include: { choices: true },
            orderBy: { order: 'asc' }
        }
    },
    orderBy: { order: 'asc' }
});

const createLesson = async (data) => {
    const { questions, ...lessonData } = data;
    const formattedData = {
        ...lessonData,
        order: parseInteger(lessonData.order, 0),
        points: parseInteger(lessonData.points, 0),
        passScore: parseInteger(lessonData.passScore, 0)
    };

    if (lessonData.type === 'quiz' && questions && questions.length > 0) {
        formattedData.questions = {
            create: questions.map((question, index) => ({
                text: question.text,
                order: index,
                points: parseInteger(question.points, 1),
                choices: {
                    create: question.choices.map((choice) => ({
                        text: choice.text,
                        isCorrect: !!choice.isCorrect
                    }))
                }
            }))
        };
    }

    return prisma.lesson.create({
        data: formattedData,
        include: {
            questions: {
                include: { choices: true }
            }
        }
    });
};

const updateLesson = async (id, data) => {
    const { questions, ...lessonData } = data;

    if (lessonData.type === 'quiz') {
        await prisma.question.deleteMany({
            where: { lessonId: id }
        });
    }

    const formattedData = {
        ...lessonData,
        order: parseInteger(lessonData.order, 0),
        points: parseInteger(lessonData.points, 0),
        passScore: parseInteger(lessonData.passScore, 0)
    };

    if (lessonData.type === 'quiz' && questions && questions.length > 0) {
        formattedData.questions = {
            create: questions.map((question, index) => ({
                text: question.text,
                order: index,
                points: parseInteger(question.points, 1),
                choices: {
                    create: question.choices.map((choice) => ({
                        text: choice.text,
                        isCorrect: !!choice.isCorrect
                    }))
                }
            }))
        };
    }

    return prisma.lesson.update({
        where: { id },
        data: formattedData,
        include: {
            questions: {
                include: { choices: true }
            }
        }
    });
};

const deleteLesson = async (id) => prisma.lesson.delete({ where: { id } });

const getCourseQuizAttempts = async (courseId) => {
    const attempts = await prisma.quizAttempt.findMany({
        where: {
            lesson: {
                courseId
            }
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    department: true,
                    departmentRef: {
                        select: {
                            name: true
                        }
                    },
                    tier: {
                        select: {
                            name: true
                        }
                    }
                }
            },
            lesson: {
                select: {
                    id: true,
                    title: true,
                    passScore: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return attempts.map((attempt) => ({
        ...attempt,
        user: {
            ...attempt.user,
            department: attempt.user.departmentRef?.name || attempt.user.department || null,
            tier: attempt.user.tier?.name || null
        }
    }));
};

module.exports = {
    getDashboardStats,
    getUsers,
    getUserDetails,
    createUser,
    updateUser,
    deleteUser,
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getTiers,
    createTier,
    updateTier,
    deleteTier,
    getAdminCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    getAdminRewards,
    createReward,
    updateReward,
    deleteReward,
    getRedeemRequests,
    updateRedeemStatus,
    getCourseLessons,
    createLesson,
    updateLesson,
    deleteLesson,
    getCourseQuizAttempts
};
