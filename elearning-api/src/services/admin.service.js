const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');

// DASHBOARD
const getDashboardStats = async () => {
    const [totalUsers, activeCourses, totalEnrollments, categories] = await Promise.all([
        prisma.user.count({ where: { role: 'user' } }),
        prisma.course.count({ where: { status: 'PUBLISHED' } }),
        prisma.userCourse.count(),
        prisma.category.findMany({ include: { _count: { select: { courses: true } } } })
    ]);

    // Popular Courses (Top 5)
    const popularCoursesRaw = await prisma.course.findMany({
        include: { _count: { select: { enrollments: true } } },
        orderBy: { enrollments: { _count: 'desc' } },
        take: 5
    });

    const popularCourses = popularCoursesRaw.map(c => ({
        id: c.id,
        title: c.title,
        students: c._count.enrollments,
        completionRate: '85%' // Mocked for now until we have complex aggregation
    }));

    // Weekly activity (Last 7 days)
    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const nextD = new Date(d);
        nextD.setDate(d.getDate() + 1);

        const count = await prisma.userCourse.count({
            where: { createdAt: { gte: d, lt: nextD } }
        });

        weeklyActivity.push({
            date: d.toLocaleDateString('th-TH', { weekday: 'short' }),
            count
        });
    }

    const categoryDistribution = categories.map(cat => ({
        name: cat.name,
        value: cat._count.courses
    }));

    return {
        totalUsers,
        activeCourses,
        totalEnrollments,
        popularCourses,
        weeklyActivity,
        categoryDistribution
    };
};

// USERS
const getUsers = async () => {
    return await prisma.user.findMany({
        where: { role: 'user' },
        include: {
            _count: { select: { enrollments: { where: { status: 'COMPLETED' } } } }
        },
        orderBy: { pointsBalance: 'desc' }
    });
};

const createUser = async (data) => {
    const hashedPassword = await bcrypt.hash(data.password || 'password123', 10);
    return await prisma.user.create({
        data: {
            ...data,
            password: hashedPassword,
            role: data.role || 'user',
            pointsBalance: data.pointsBalance || 0
        }
    });
};

const updateUser = async (id, inputData) => {
    const { password, pointsBalance, ...data } = inputData;
    
    if (password) {
        data.password = await bcrypt.hash(password, 10);
    }

    return await prisma.$transaction(async (tx) => {
        if (pointsBalance !== undefined) {
            const newBalance = parseInt(pointsBalance, 10);
            
            const ledger = await tx.pointsLedger.findMany({ where: { userId: id } });
            const currentBalance = ledger.reduce((acc, curr) => acc + curr.points, 0);
            
            const diff = newBalance - currentBalance;
            if (diff !== 0) {
                await tx.pointsLedger.create({
                    data: {
                        userId: id,
                        sourceType: 'admin_edit',
                        points: diff,
                        note: `Admin adjusted balance by ${diff} (Target: ${newBalance})`
                    }
                });
            }
            data.pointsBalance = newBalance;
        }

        return await tx.user.update({
            where: { id },
            data
        });
    });
};

const deleteUser = async (id) => {
    return await prisma.user.delete({ where: { id } });
};

// ... existing course/category/reward methods ...
const getAdminCourses = async () => {
    return await prisma.course.findMany({
        include: { 
            category: true, 
            _count: { select: { enrollments: true, lessons: true } } 
        },
        orderBy: { createdAt: 'desc' }
    });
};

const createCourse = async (data) => {
    const createData = {
        ...data,
        rating: data.rating !== undefined ? parseFloat(data.rating) : undefined,
        reviewCount: data.reviewCount !== undefined ? parseInt(data.reviewCount) : undefined,
        studentCount: data.studentCount !== undefined ? parseInt(data.studentCount) : undefined,
        points: data.points !== undefined ? parseInt(data.points) : undefined
    };
    return await prisma.course.create({ data: createData });
};

const updateCourse = async (id, data) => {
    if (data.rating !== undefined) data.rating = parseFloat(data.rating);
    if (data.reviewCount !== undefined) data.reviewCount = parseInt(data.reviewCount);
    if (data.studentCount !== undefined) data.studentCount = parseInt(data.studentCount);
    if (data.points !== undefined) data.points = parseInt(data.points);

    return await prisma.course.update({
        where: { id },
        data
    });
};

const deleteCourse = async (id) => {
    return await prisma.course.delete({ where: { id } });
};

// CATEGORIES
const getCategories = async () => {
    return await prisma.category.findMany({ orderBy: { order: 'asc' } });
};

const createCategory = async (data) => {
    return await prisma.category.create({ data });
};

const updateCategory = async (id, data) => {
    return await prisma.category.update({
        where: { id },
        data: { name: data.name, order: data.order }
    });
};

const deleteCategory = async (id) => {
    return await prisma.category.delete({ where: { id } });
};

const reorderCategories = async (categoryIds) => {
    const updates = categoryIds.map((id, index) => 
        prisma.category.update({
            where: { id },
            data: { order: index }
        })
    );
    return await prisma.$transaction(updates);
};

// REWARDS
const getAdminRewards = async () => {
    return await prisma.reward.findMany({ orderBy: { createdAt: 'desc' } });
};

const createReward = async (data) => {
    return await prisma.reward.create({
        data: { 
            ...data,
            pointsCost: parseInt(data.pointsCost), 
            stock: parseInt(data.stock), 
            maxPerUser: data.maxPerUser !== undefined ? parseInt(data.maxPerUser) : 1,
        }
    });
};

const updateReward = async (id, data) => {
    const updateData = { ...data };
    if (updateData.maxPerUser !== undefined) updateData.maxPerUser = parseInt(updateData.maxPerUser);
    if (updateData.pointsCost !== undefined) updateData.pointsCost = parseInt(updateData.pointsCost);
    if (updateData.stock !== undefined) updateData.stock = parseInt(updateData.stock);

    return await prisma.reward.update({
        where: { id },
        data: updateData
    });
};

// REDEMPTIONS
const getRedeemRequests = async () => {
    return await prisma.redeemRequest.findMany({
        include: { user: { select: { name: true, email: true } }, reward: true },
        orderBy: { requestedAt: 'desc' }
    });
};

const updateRedeemStatus = async (id, status, adminNote) => {
    const request = await prisma.redeemRequest.findUnique({ where: { id } });
    if (!request) throw new Error('Request not found');

    return await prisma.$transaction(async (tx) => {
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
                data: { stock: { increment: 1 } }
            });
        }

        return await tx.redeemRequest.update({
            where: { id },
            data: { status, adminNote, updatedAt: new Date() }
        });
    });
};

// LESSONS
const getCourseLessons = async (courseId) => {
    return await prisma.lesson.findMany({
        where: { courseId },
        include: {
            questions: {
                include: { choices: true },
                orderBy: { order: 'asc' }
            }
        },
        orderBy: { order: 'asc' }
    });
};

const createLesson = async (data) => {
    const { questions, ...lessonData } = data;
    
    const formattedData = {
        ...lessonData,
        order: parseInt(lessonData.order) || 0,
        points: parseInt(lessonData.points) || 0,
        passScore: parseInt(lessonData.passScore) || 0
    };

    if (lessonData.type === 'quiz' && questions && questions.length > 0) {
        formattedData.questions = {
            create: questions.map((q, idx) => ({
                text: q.text,
                order: idx,
                points: parseInt(q.points) || 1,
                choices: {
                    create: q.choices.map(c => ({
                        text: c.text,
                        isCorrect: !!c.isCorrect
                    }))
                }
            }))
        };
    }

    return await prisma.lesson.create({
        data: formattedData,
        include: { questions: { include: { choices: true } } }
    });
};

const updateLesson = async (id, data) => {
    const { questions, ...lessonData } = data;
    
    if (lessonData.type === 'quiz') {
        await prisma.question.deleteMany({ where: { lessonId: id } });
    }

    const formattedData = {
        ...lessonData,
        order: parseInt(lessonData.order) || 0,
        points: parseInt(lessonData.points) || 0,
        passScore: parseInt(lessonData.passScore) || 0
    };

    if (lessonData.type === 'quiz' && questions && questions.length > 0) {
        formattedData.questions = {
            create: questions.map((q, idx) => ({
                text: q.text,
                order: idx,
                points: parseInt(q.points) || 1,
                choices: {
                    create: q.choices.map(c => ({
                        text: c.text,
                        isCorrect: !!c.isCorrect
                    }))
                }
            }))
        };
    }

    return await prisma.lesson.update({
        where: { id },
        data: formattedData,
        include: { questions: { include: { choices: true } } }
    });
};

const deleteLesson = async (id) => {
    return await prisma.lesson.delete({ where: { id } });
};

const getCourseQuizAttempts = async (courseId) => {
    return await prisma.quizAttempt.findMany({
        where: {
            lesson: {
                courseId: courseId
            }
        },
        include: {
            user: { select: { id: true, name: true, email: true, department: true } },
            lesson: { select: { id: true, title: true, passScore: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
};

module.exports = {
    getDashboardStats,
    getUsers,
    createUser,
    updateUser,
    deleteUser,
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
    getRedeemRequests,
    updateRedeemStatus,
    getCourseLessons,
    createLesson,
    updateLesson,
    deleteLesson,
    getCourseQuizAttempts
};
