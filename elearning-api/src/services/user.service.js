const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');

const mapPublicUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    employmentDate: user.employmentDate || user.createdAt,
    departmentId: user.departmentRef?.id || user.departmentId || null,
    department: user.departmentRef?.name || user.department || null,
    tierId: user.tier?.id || user.tierId || null,
    tier: user.tier ? {
        id: user.tier.id,
        name: user.tier.name,
        accessAdmin: user.tier.accessAdmin
    } : null
});

const getUserVisibilityContext = async (userId) => prisma.user.findUnique({
    where: { id: userId },
    select: {
        departmentId: true,
        tierId: true,
        tier: {
            select: {
                name: true
            }
        }
    }
});

const normalizeTierName = (value) => String(value || '').trim().toLowerCase();

const TIER_RANK_MAP = {
    supervisor: 1,
    manager: 2,
    director: 3
};

const getTierRank = (tierName) => TIER_RANK_MAP[normalizeTierName(tierName)] || 0;

const buildCategoryVisibilityWhere = (userContext) => {
    const departmentConditions = [{ departmentAccess: { none: {} } }];

    if (userContext?.departmentId) {
        departmentConditions.push({
            departmentAccess: {
                some: {
                    departmentId: userContext.departmentId
                }
            }
        });
    }

    return {
        OR: [
            { visibleToAll: true },
            {
                visibleToAll: false,
                AND: [{ OR: departmentConditions }]
            }
        ]
    };
};

const buildCourseVisibilityWhere = (userContext) => {
    const departmentConditions = [{ departmentAccess: { none: {} } }];

    if (userContext?.departmentId) {
        departmentConditions.push({
            departmentAccess: {
                some: {
                    departmentId: userContext.departmentId
                }
            }
        });
    }

    return {
        status: 'PUBLISHED',
        OR: [
            { visibleToAll: true },
            {
                visibleToAll: false,
                AND: [{ OR: departmentConditions }]
            }
        ]
    };
};

const getVisibleCourseQuery = async (userId) => {
    return getUserVisibilityContext(userId);
};

const canAccessByDepartment = (course, userContext) => {
    const departmentAccess = Array.isArray(course.departmentAccess) ? course.departmentAccess : [];

    if (departmentAccess.length === 0) {
        return true;
    }

    if (!userContext?.departmentId) {
        return false;
    }

    return departmentAccess.some((entry) => entry.departmentId === userContext.departmentId);
};

const canAccessByTierHierarchy = (entity, userContext) => {
    const tierAccess = Array.isArray(entity.tierAccess) ? entity.tierAccess : [];

    if (tierAccess.length === 0) {
        return true;
    }

    const userTierName = userContext?.tier?.name || '';
    const userRank = getTierRank(userTierName);
    const tierNames = tierAccess.map((entry) => entry.tier?.name).filter(Boolean);
    const tierRanks = tierNames.map((name) => getTierRank(name)).filter(Boolean);

    if (tierRanks.length > 0) {
        return userRank >= Math.min(...tierRanks);
    }

    return tierNames.some((name) => normalizeTierName(name) === normalizeTierName(userTierName));
};

const canAccessScopedEntity = (entity, userContext) => {
    if (!entity || entity.visibleToAll) {
        return true;
    }

    return canAccessByDepartment(entity, userContext) && canAccessByTierHierarchy(entity, userContext);
};

const canAccessCourse = (course, userContext) => {
    const category = course?.category;
    return canAccessScopedEntity(category, userContext) && canAccessScopedEntity(course, userContext);
};

const getCourseRewardSummary = (course) => {
    const completionPoints = Number(course?.points) || 0;
    const quizPoints = Array.isArray(course?.lessons)
        ? course.lessons.reduce((sum, lesson) => {
            if (lesson?.type !== 'quiz') {
                return sum;
            }

            return sum + (Number(lesson?.points) || 0);
        }, 0)
        : 0;

    return {
        completionPoints,
        quizPoints,
        totalPoints: completionPoints + quizPoints
    };
};

const getCourses = async (userId) => {
    const userContext = await getVisibleCourseQuery(userId);
    const courses = await prisma.course.findMany({
        where: buildCourseVisibilityWhere(userContext),
        include: {
            category: {
                include: {
                    departmentAccess: {
                        include: {
                            department: true
                        }
                    },
                    tierAccess: {
                        include: {
                            tier: true
                        }
                    }
                }
            },
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
            lessons: {
                select: {
                    type: true,
                    points: true
                }
            },
            enrollments: {
                where: { userId }
            }
        }
    });

    return courses
        .filter((course) => canAccessCourse(course, userContext))
        .map((course) => {
        const enrollment = course.enrollments[0];
        const rewardSummary = getCourseRewardSummary(course);

        return {
            ...course,
            enrollments: undefined,
            departmentAccess: undefined,
            tierAccess: undefined,
            category: course.category
                ? {
                    ...course.category,
                    departmentAccess: undefined,
                    tierAccess: undefined
                }
                : null,
            lessons: undefined,
            isEnrolled: !!enrollment,
            enrollmentStatus: enrollment ? enrollment.status : null,
            progressPercent: enrollment ? enrollment.progressPercent : 0,
            completedAt: enrollment ? enrollment.completedAt : null,
            ...rewardSummary
        };
    });
};

const updateProfile = async (userId, data) => {
    const { currentPassword, newPassword } = data;
    const dataToUpdate = {};

    if (currentPassword && newPassword) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const validPassword = await bcrypt.compare(currentPassword, user.password);

        if (!validPassword) {
            throw new Error('เธฃเธซเธฑเธชเธเนเธฒเธเธเธฑเธเธเธธเธเธฑเธเนเธกเนเธ–เธนเธเธ•เนเธญเธ');
        }

        dataToUpdate.password = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(dataToUpdate).length > 0) {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: dataToUpdate,
            include: {
                departmentRef: true,
                tier: true
            }
        });

        return mapPublicUser(updatedUser);
    }

    const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            departmentRef: true,
            tier: true
        }
    });

    return mapPublicUser(currentUser);
};

const getCourseDetails = async (courseId, userId) => {
    const userContext = await getVisibleCourseQuery(userId);
    const course = await prisma.course.findFirst({
        where: {
            id: courseId,
            ...buildCourseVisibilityWhere(userContext)
        },
        include: {
            category: {
                include: {
                    departmentAccess: {
                        include: {
                            department: true
                        }
                    },
                    tierAccess: {
                        include: {
                            tier: true
                        }
                    }
                }
            },
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
            lessons: {
                orderBy: { order: 'asc' },
                include: {
                    progress: {
                        where: { userId }
                    },
                    // Only send quiz metadata count, NOT full questions/choices
                    // Full questions are loaded separately in submitQuiz
                    _count: {
                        select: { questions: true }
                    },
                    quizAttempts: {
                        where: { userId },
                        orderBy: { score: 'desc' },
                        take: 1
                    }
                }
            },
            enrollments: {
                where: { userId }
            }
        }
    });

    if (!course || !canAccessCourse(course, userContext)) {
        return null;
    }

    const enrollment = course.enrollments[0];
    const rewardSummary = getCourseRewardSummary(course);

    return {
        ...course,
        enrollments: undefined,
        departmentAccess: undefined,
        tierAccess: undefined,
        category: course.category
            ? {
                ...course.category,
                departmentAccess: undefined,
                tierAccess: undefined
            }
            : null,
        isEnrolled: !!enrollment,
        enrollmentStatus: enrollment ? enrollment.status : null,
        progressPercent: enrollment ? enrollment.progressPercent : 0,
        completedAt: enrollment ? enrollment.completedAt : null,
        ...rewardSummary,
        lessons: course.lessons.map((lesson) => ({
            ...lesson,
            progress: lesson.progress[0] || null,
            isCompleted: lesson.progress[0]?.progress === 100,
            bestScore: lesson.quizAttempts[0]?.score || null,
            questionCount: lesson._count?.questions || 0,
            _count: undefined,
            quizAttempts: undefined
        }))
    };
};

const enrollCourse = async (userId, courseId) => {
    const userContext = await getVisibleCourseQuery(userId);
    const course = await prisma.course.findFirst({
        where: {
            id: courseId,
            ...buildCourseVisibilityWhere(userContext)
        },
        include: {
            category: {
                include: {
                    departmentAccess: true,
                    tierAccess: {
                        include: {
                            tier: true
                        }
                    }
                }
            },
            departmentAccess: true,
            tierAccess: {
                include: {
                    tier: true
                }
            }
        }
    });

    if (!course || !canAccessCourse(course, userContext)) {
        throw new Error('Course not found');
    }

    const existing = await prisma.userCourse.findUnique({
        where: {
            userId_courseId: { userId, courseId }
        }
    });

    if (existing) {
        throw new Error('Already enrolled in this course');
    }

    return prisma.userCourse.create({
        data: {
            userId,
            courseId,
            status: 'IN_PROGRESS',
            progressPercent: 0
        }
    });
};

const updateLessonProgress = async (userId, lessonId, progress) => {
    const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { course: true }
    });

    if (!lesson) {
        throw new Error('Lesson not found');
    }

    const enrollment = await prisma.userCourse.findUnique({
        where: {
            userId_courseId: {
                userId,
                courseId: lesson.courseId
            }
        }
    });

    if (!enrollment) {
        throw new Error('Not enrolled in this course');
    }

    const isCompleted = progress === 100;
    const lessonProgress = await prisma.userLessonProgress.upsert({
        where: {
            userId_lessonId: {
                userId,
                lessonId
            }
        },
        update: {
            progress,
            lastSeenAt: new Date(),
            completedAt: isCompleted ? new Date() : null
        },
        create: {
            userId,
            lessonId,
            progress,
            completedAt: isCompleted ? new Date() : null
        }
    });

    if (isCompleted && enrollment.status !== 'COMPLETED') {
        const allLessons = await prisma.lesson.findMany({
            where: { courseId: lesson.courseId }
        });
        const completedLessons = await prisma.userLessonProgress.findMany({
            where: {
                userId,
                lessonId: { in: allLessons.map((item) => item.id) },
                progress: 100
            }
        });

        const newProgressPercent = Math.round((completedLessons.length / allLessons.length) * 100);
        const updateData = { progressPercent: newProgressPercent };

        if (newProgressPercent === 100) {
            updateData.status = 'COMPLETED';
            updateData.completedAt = new Date();

            if (lesson.course.points > 0) {
                const existingPoints = await prisma.pointsLedger.findFirst({
                    where: {
                        userId,
                        sourceType: 'course',
                        sourceId: lesson.courseId
                    }
                });

                if (!existingPoints) {
                    await prisma.pointsLedger.create({
                        data: {
                            userId,
                            sourceType: 'course',
                            sourceId: lesson.courseId,
                            points: lesson.course.points,
                            note: `Completed course: ${lesson.course.title}`
                        }
                    });
                }
            }
        }

        await prisma.userCourse.update({
            where: { id: enrollment.id },
            data: updateData
        });
    }

    return lessonProgress;
};

const submitQuiz = async (userId, lessonId, answers) => {
    const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
            course: true,
            questions: {
                include: {
                    choices: true
                }
            }
        }
    });

    if (!lesson || lesson.type !== 'quiz') {
        throw new Error('Quiz not found');
    }

    let score = 0;
    let totalPoints = 0;
    const correctAnswers = {};

    lesson.questions.forEach((question) => {
        totalPoints += question.points;
        const userChoiceId = answers[question.id];
        const correctChoice = question.choices.find((choice) => choice.isCorrect);

        if (correctChoice) {
            correctAnswers[question.id] = correctChoice.id;

            if (correctChoice.id === userChoiceId) {
                score += question.points;
            }
        }
    });

    const passScore = lesson.passScore || 60;
    const scorePercent = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 100;
    const passed = scorePercent >= passScore;

    const previousPass = await prisma.quizAttempt.findFirst({
        where: {
            userId,
            lessonId,
            status: 'PASSED'
        }
    });

    const attempt = await prisma.quizAttempt.create({
        data: {
            userId,
            lessonId,
            score: scorePercent,
            status: passed ? 'PASSED' : 'FAILED'
        }
    });

    const isCompleted = passed && !previousPass;
    let earnedQuizPoints = 0;
    let earnedCoursePoints = 0;

    if (passed && lesson.points > 0) {
        const existingQuizPoints = await prisma.pointsLedger.findFirst({
            where: {
                userId,
                sourceType: 'quiz',
                sourceId: lessonId
            }
        });

        if (!existingQuizPoints) {
            await prisma.pointsLedger.create({
                data: {
                    userId,
                    sourceType: 'quiz',
                    sourceId: lessonId,
                    points: lesson.points,
                    note: `Passed quiz: ${lesson.title}`
                }
            });

            earnedQuizPoints = lesson.points;
        }
    }

    if (isCompleted) {
        await prisma.userLessonProgress.upsert({
            where: {
                userId_lessonId: {
                    userId,
                    lessonId
                }
            },
            update: {
                progress: 100,
                lastSeenAt: new Date(),
                completedAt: new Date()
            },
            create: {
                userId,
                lessonId,
                progress: 100,
                completedAt: new Date()
            }
        });

        const enrollment = await prisma.userCourse.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId: lesson.courseId
                }
            }
        });

        if (enrollment && enrollment.status !== 'COMPLETED') {
            const allLessons = await prisma.lesson.findMany({
                where: { courseId: lesson.courseId }
            });
            const completedLessons = await prisma.userLessonProgress.findMany({
                where: {
                    userId,
                    lessonId: { in: allLessons.map((item) => item.id) },
                    progress: 100
                }
            });

            const newProgressPercent = Math.round((completedLessons.length / allLessons.length) * 100);
            const updateData = { progressPercent: newProgressPercent };

            if (newProgressPercent === 100) {
                updateData.status = 'COMPLETED';
                updateData.completedAt = new Date();

                if (lesson.course.points > 0) {
                    const existingPoints = await prisma.pointsLedger.findFirst({
                        where: {
                            userId,
                            sourceType: 'course',
                            sourceId: lesson.courseId
                        }
                    });

                    if (!existingPoints) {
                        await prisma.pointsLedger.create({
                            data: {
                                userId,
                                sourceType: 'course',
                                sourceId: lesson.courseId,
                                points: lesson.course.points,
                                note: `Completed course: ${lesson.course.title}`
                            }
                        });
                        earnedCoursePoints = lesson.course.points;
                    }
                }
            }

            await prisma.userCourse.update({
                where: { id: enrollment.id },
                data: updateData
            });
        }
    }

    return {
        attempt,
        score,
        scorePercent,
        passed,
        isCompleted,
        passScore,
        correctAnswers,
        earnedQuizPoints,
        earnedCoursePoints,
        earnedPoints: earnedQuizPoints + earnedCoursePoints
    };
};

const getPointsHistory = async (userId) => {
    const [ledger, aggregation] = await Promise.all([
        prisma.pointsLedger.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.pointsLedger.aggregate({
            where: { userId },
            _sum: { points: true }
        })
    ]);

    return {
        balance: aggregation._sum.points || 0,
        history: ledger
    };
};

const getRewardsData = async (userId) => {
    const rewards = await prisma.reward.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { pointsCost: 'asc' }
    });

    const userRequests = await prisma.redeemRequest.groupBy({
        by: ['rewardId'],
        where: {
            userId,
            status: {
                not: 'REJECTED'
            }
        },
        _count: {
            id: true
        }
    });

    const countMap = {};
    userRequests.forEach((request) => {
        countMap[request.rewardId] = request._count.id;
    });

    return rewards.map((reward) => ({
        ...reward,
        userRedeemedCount: countMap[reward.id] || 0
    }));
};

const requestRedeem = async (userId, rewardId) => {
    const reward = await prisma.reward.findUnique({
        where: { id: rewardId }
    });

    if (!reward || reward.status !== 'ACTIVE' || reward.stock <= 0) {
        throw new Error('Reward unavailable or out of stock');
    }

    const userRedeemed = await prisma.redeemRequest.count({
        where: {
            userId,
            rewardId,
            status: {
                not: 'REJECTED'
            }
        }
    });

    if (userRedeemed >= reward.maxPerUser) {
        throw new Error('เธเธธเธ“เนเธฅเธเธฃเธฒเธเธงเธฑเธฅเธเธตเนเธเธฃเธเธ•เธฒเธกเธชเธดเธ—เธเธดเธ—เธตเนเธเธณเธซเธเธ”เนเธฅเนเธง');
    }

    const balanceResult = await prisma.pointsLedger.aggregate({
        where: { userId },
        _sum: { points: true }
    });
    const balance = balanceResult._sum.points || 0;

    if (balance < reward.pointsCost) {
        throw new Error('Insufficient points');
    }

    return prisma.$transaction(async (tx) => {
        const request = await tx.redeemRequest.create({
            data: {
                userId,
                rewardId,
                pointsCost: reward.pointsCost
            }
        });

        await tx.pointsLedger.create({
            data: {
                userId,
                sourceType: 'redeem',
                sourceId: request.id,
                points: -reward.pointsCost,
                note: `Redeemed: ${reward.name}`
            }
        });

        await tx.reward.update({
            where: { id: reward.id },
            data: {
                stock: {
                    decrement: 1
                }
            }
        });

        return request;
    });
};

const getCategories = async (userId) => {
    const userContext = await getVisibleCourseQuery(userId);
    const categories = await prisma.category.findMany({
        where: buildCategoryVisibilityWhere(userContext),
        include: {
            departmentAccess: {
                include: {
                    department: true
                }
            },
            tierAccess: {
                include: {
                    tier: true
                }
            }
        },
        orderBy: { order: 'asc' }
    });

    return categories
        .filter((category) => canAccessScopedEntity(category, userContext))
        .map((category) => ({
            ...category,
            departmentAccess: undefined,
            tierAccess: undefined
        }));
};

// Fetch quiz questions for a specific lesson (called only from LessonPlayer)
const getLessonQuestions = async (lessonId) => {
    const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
            questions: {
                include: {
                    choices: {
                        select: {
                            id: true,
                            questionId: true,
                            text: true
                        }
                    }
                },
                orderBy: { order: 'asc' }
            }
        }
    });
    return lesson?.questions || [];
};

module.exports = {
    getCourses,
    updateProfile,
    getCourseDetails,
    enrollCourse,
    updateLessonProgress,
    submitQuiz,
    getPointsHistory,
    getRewardsData,
    requestRedeem,
    getCategories,
    getLessonQuestions
};
