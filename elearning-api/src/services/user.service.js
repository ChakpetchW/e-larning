const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');

const getCourses = async (userId) => {
    const courses = await prisma.course.findMany({
        where: { status: 'PUBLISHED' },
        include: {
            category: true,
            enrollments: {
                where: { userId }
            }
        }
    });

    return courses.map(course => {
        const enrollment = course.enrollments[0];
        return {
            ...course,
            enrollments: undefined,
            isEnrolled: !!enrollment,
            enrollmentStatus: enrollment ? enrollment.status : null,
            progressPercent: enrollment ? enrollment.progressPercent : 0,
            completedAt: enrollment ? enrollment.completedAt : null
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
            throw new Error('รหัสผ่านปัจจุบันไม่ถูกต้อง');
        }
        dataToUpdate.password = await bcrypt.hash(newPassword, 10);
    }
    
    if (Object.keys(dataToUpdate).length > 0) {
        return await prisma.user.update({
            where: { id: userId },
            data: dataToUpdate,
            select: { id: true, name: true, email: true, role: true, department: true }
        });
    } else {
        return await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, role: true, department: true }
        });
    }
};

const getCourseDetails = async (courseId, userId) => {
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            category: true,
            lessons: {
                orderBy: { order: 'asc' },
                include: {
                    progress: {
                        where: { userId }
                    },
                    questions: {
                        include: {
                            choices: { select: { id: true, questionId: true, text: true } }
                        },
                        orderBy: { order: 'asc' }
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

    if (!course) throw new Error('Course not found');

    const enrollment = course.enrollments[0];
    
    return {
        ...course,
        enrollments: undefined,
        isEnrolled: !!enrollment,
        enrollmentStatus: enrollment ? enrollment.status : null,
        progressPercent: enrollment ? enrollment.progressPercent : 0,
        completedAt: enrollment ? enrollment.completedAt : null,
        lessons: course.lessons.map(lesson => ({
            ...lesson,
            progress: lesson.progress[0] || null,
            isCompleted: lesson.progress[0]?.isCompleted || false,
            bestScore: lesson.quizAttempts[0]?.score || null,
            quizAttempts: undefined
        }))
    };
};

const enrollCourse = async (userId, courseId) => {
    const existing = await prisma.userCourse.findUnique({
        where: { userId_courseId: { userId, courseId } }
    });

    if (existing) {
        throw new Error('Already enrolled in this course');
    }

    return await prisma.userCourse.create({
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

    if (!lesson) throw new Error('Lesson not found');

    const enrollment = await prisma.userCourse.findUnique({
        where: { userId_courseId: { userId, courseId: lesson.courseId } }
    });

    if (!enrollment) throw new Error('Not enrolled in this course');

    const isCompleted = progress === 100;
    const lessonProgress = await prisma.userLessonProgress.upsert({
        where: { userId_lessonId: { userId, lessonId } },
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
        const allLessons = await prisma.lesson.findMany({ where: { courseId: lesson.courseId } });
        const completedLessons = await prisma.userLessonProgress.findMany({
            where: { userId, lessonId: { in: allLessons.map(l => l.id) }, progress: 100 }
        });

        const newProgressPercent = Math.round((completedLessons.length / allLessons.length) * 100);

        const updateData = { progressPercent: newProgressPercent };
        if (newProgressPercent === 100) {
            updateData.status = 'COMPLETED';
            updateData.completedAt = new Date();

            if (lesson.course.points > 0) {
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
            questions: { include: { choices: true } }
        }
    });

    if (!lesson || lesson.type !== 'quiz') throw new Error('Quiz not found');

    let score = 0;
    let totalPoints = 0;
    const correctAnswers = {};
    
    lesson.questions.forEach(q => {
        totalPoints += q.points;
        const userChoiceId = answers[q.id];
        const correctChoice = q.choices.find(c => c.isCorrect);
        
        if (correctChoice) {
            correctAnswers[q.id] = correctChoice.id;
            if (correctChoice.id === userChoiceId) {
                score += q.points;
            }
        }
    });

    const passScore = lesson.passScore || 60;
    const scorePercent = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 100;
    const passed = scorePercent >= passScore;

    const previousPass = await prisma.quizAttempt.findFirst({
        where: { userId, lessonId, status: 'PASSED' }
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

    if (isCompleted) {
        await prisma.userLessonProgress.upsert({
            where: { userId_lessonId: { userId, lessonId } },
            update: { progress: 100, lastSeenAt: new Date(), completedAt: new Date() },
            create: { userId, lessonId, progress: 100, completedAt: new Date() }
        });
        
        const enrollment = await prisma.userCourse.findUnique({
            where: { userId_courseId: { userId, courseId: lesson.courseId } }
        });
        
        if (enrollment && enrollment.status !== 'COMPLETED') {
            const allLessons = await prisma.lesson.findMany({ where: { courseId: lesson.courseId } });
            const completedLessons = await prisma.userLessonProgress.findMany({
                where: { userId, lessonId: { in: allLessons.map(l => l.id) }, progress: 100 }
            });
            
            const newProgressPercent = Math.round((completedLessons.length / allLessons.length) * 100);
            const updateData = { progressPercent: newProgressPercent };
            
            if (newProgressPercent === 100) {
                updateData.status = 'COMPLETED';
                updateData.completedAt = new Date();
                
                if (lesson.course.points > 0) {
                    const existingPoints = await prisma.pointsLedger.findFirst({
                        where: { userId, sourceType: 'course', sourceId: lesson.courseId }
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
            await prisma.userCourse.update({ where: { id: enrollment.id }, data: updateData });
        }
    }

    return { attempt, score, scorePercent, passed, isCompleted, passScore, correctAnswers };
};

const getPointsHistory = async (userId) => {
    const ledger = await prisma.pointsLedger.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
    const balance = ledger.reduce((acc, curr) => acc + curr.points, 0);
    return { balance, history: ledger };
};

const getRewardsData = async (userId) => {
    const rewards = await prisma.reward.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { pointsCost: 'asc' }
    });
    
    const userRequests = await prisma.redeemRequest.groupBy({
       by: ['rewardId'],
       where: { userId, status: { not: 'REJECTED' } },
       _count: { id: true }
    });
    
    const countMap = {};
    userRequests.forEach(r => countMap[r.rewardId] = r._count.id);

    return rewards.map(r => ({
        ...r,
        userRedeemedCount: countMap[r.id] || 0
    }));
};

const requestRedeem = async (userId, rewardId) => {
    const reward = await prisma.reward.findUnique({ where: { id: rewardId } });
    if (!reward || reward.status !== 'ACTIVE' || reward.stock <= 0) {
        throw new Error('Reward unavailable or out of stock');
    }

    const userRedeemed = await prisma.redeemRequest.count({
        where: { userId, rewardId, status: { not: 'REJECTED' } }
    });
    if (userRedeemed >= reward.maxPerUser) {
        throw new Error('คุณแลกรางวัลนี้ครบตามสิทธิที่กำหนดแล้ว');
    }

    const ledger = await prisma.pointsLedger.findMany({ where: { userId } });
    const balance = ledger.reduce((acc, curr) => acc + curr.points, 0);

    if (balance < reward.pointsCost) {
        throw new Error('Insufficient points');
    }

    return await prisma.$transaction(async (tx) => {
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
            data: { stock: { decrement: 1 } }
        });

        return request;
    });
};

const getCategories = async () => {
    return await prisma.category.findMany({
        orderBy: { order: 'asc' }
    });
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
    getCategories
};
