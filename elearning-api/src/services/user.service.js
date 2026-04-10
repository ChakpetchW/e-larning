const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');

const SUPABASE_BUCKET = 'uploads';
const DOCUMENT_SIGNED_URL_TTL_SECONDS = 90;
const DOCUMENT_ACCESS_TOKEN_TTL_SECONDS = 120;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

const isProtectedDocumentLesson = (lesson) => (
    !!lesson?.contentUrl && !['video', 'quiz'].includes(String(lesson?.type || '').toLowerCase())
);

const getStorageObjectRefFromContentUrl = (contentUrl) => {
    const trimmedUrl = String(contentUrl || '').trim();

    if (!trimmedUrl) {
        return null;
    }

    if (!/^https?:\/\//i.test(trimmedUrl)) {
        return {
            bucket: SUPABASE_BUCKET,
            path: trimmedUrl.replace(/^\/+/, '').replace(/^uploads\//, '')
        };
    }

    try {
        const parsedUrl = new URL(trimmedUrl);
        const match = parsedUrl.pathname.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+)$/);

        if (match) {
            return {
                bucket: decodeURIComponent(match[1]),
                path: decodeURIComponent(match[2])
            };
        }
    } catch (error) {
        return null;
    }

    return null;
};

const createDocumentAccessToken = ({ userId, lessonId, contentUrl }) => {
    const storageRef = getStorageObjectRefFromContentUrl(contentUrl);
    const sourceUrl = String(contentUrl || '').trim();

    if (!storageRef?.path && !/^https?:\/\//i.test(sourceUrl)) {
        throw new ErrorResponse('Document source is unavailable', 404);
    }

    return jwt.sign(
        {
            type: 'document_access',
            userId,
            lessonId,
            bucket: storageRef?.bucket || SUPABASE_BUCKET,
            path: storageRef?.path || null,
            sourceUrl: storageRef?.path ? null : sourceUrl
        },
        process.env.JWT_SECRET,
        { expiresIn: DOCUMENT_ACCESS_TOKEN_TTL_SECONDS }
    );
};

const verifyDocumentAccessToken = (token, lessonId) => {
    if (!token) {
        throw new ErrorResponse('Document access token is required', 401);
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        if (
            payload?.type !== 'document_access'
            || payload?.lessonId !== lessonId
            || (!payload?.path && !payload?.sourceUrl)
        ) {
            throw new ErrorResponse('Invalid document access token', 401);
        }

        return payload;
    } catch (error) {
        if (error instanceof ErrorResponse) {
            throw error;
        }

        throw new ErrorResponse('Invalid or expired document access token', 401);
    }
};

const getDocumentFilename = (documentRef) => {
    const rawRef = String(documentRef || '').trim();

    if (!rawRef) {
        return 'document';
    }

    if (!/^https?:\/\//i.test(rawRef)) {
        return decodeURIComponent(path.posix.basename(rawRef)) || 'document';
    }

    try {
        const parsedUrl = new URL(rawRef);
        return decodeURIComponent(path.posix.basename(parsedUrl.pathname)) || 'document';
    } catch (error) {
        return 'document';
    }
};

const getDocumentPreviewMeta = (documentRef) => {
    const fileName = getDocumentFilename(documentRef);
    const lowerFileName = fileName.toLowerCase();
    const extensionMatch = lowerFileName.match(/\.([a-z0-9]+)$/i);
    const extension = extensionMatch?.[1] || '';
    const pdfExtensions = ['pdf'];
    const officeExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];

    return {
        fileName,
        extension,
        viewerType: pdfExtensions.includes(extension)
            ? 'pdf'
            : officeExtensions.includes(extension)
                ? 'office'
                : 'document'
    };
};

const getDocumentUpstreamResponse = async (documentAccessPayload) => {
    const { bucket, path: storagePath, sourceUrl } = documentAccessPayload || {};
    let upstreamUrl = '';
    let fileName = 'document';

    if (storagePath) {
        if (!supabase) {
            throw new ErrorResponse('Secure document storage is unavailable', 500);
        }

        const { data, error } = await supabase.storage
            .from(bucket || SUPABASE_BUCKET)
            .createSignedUrl(storagePath, DOCUMENT_SIGNED_URL_TTL_SECONDS);

        if (error || !data?.signedUrl) {
            throw new ErrorResponse('Unable to create secure document access', 500);
        }

        upstreamUrl = data.signedUrl;
        fileName = getDocumentFilename(storagePath);
    } else if (sourceUrl) {
        upstreamUrl = sourceUrl;
        fileName = getDocumentFilename(sourceUrl);
    } else {
        throw new ErrorResponse('Document source is unavailable', 404);
    }

    const upstreamResponse = await fetch(upstreamUrl, {
        method: 'GET',
        redirect: 'follow'
    });

    if (!upstreamResponse.ok || !upstreamResponse.body) {
        throw new ErrorResponse('Unable to load secure document preview', 502);
    }

    return {
        upstreamResponse,
        fileName
    };
};

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
        role: true,
        departmentId: true,
        tierId: true,
        tier: {
            select: {
                name: true,
                order: true
            }
        }
    }
});

const buildTemporaryVisibilityWhere = (referenceDate = new Date()) => ({
    OR: [
        { isTemporary: false },
        { expiredAt: null },
        { expiredAt: { gt: referenceDate } }
    ]
});

const isTemporaryEntityVisible = (entity, referenceDate = new Date()) => {
    if (!entity?.isTemporary) {
        return true;
    }

    if (!entity?.expiredAt) {
        return true;
    }

    return new Date(entity.expiredAt) > referenceDate;
};

const buildCategoryVisibilityWhere = (userContext, referenceDate = new Date()) => {
    if (userContext?.role === 'admin') {
        return buildTemporaryVisibilityWhere(referenceDate);
    }

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
        AND: [
            buildTemporaryVisibilityWhere(referenceDate),
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

const buildCourseVisibilityWhere = (userContext, referenceDate = new Date()) => {
    if (userContext?.role === 'admin') {
        return {
            status: 'PUBLISHED',
            ...buildTemporaryVisibilityWhere(referenceDate)
        };
    }

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
        AND: [
            { status: 'PUBLISHED' },
            buildTemporaryVisibilityWhere(referenceDate),
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

    const userTierOrder = userContext?.tier?.order ?? 999;
    const requiredOrders = tierAccess
        .map((entry) => entry.tier?.order)
        .filter((order) => order !== undefined && order !== null);

    if (requiredOrders.length > 0) {
        // Hierarchy logic: A user with lower order value (higher rank)
        // can see anything that requires their rank OR anything that ranks lower (higher order value).
        // e.g. Manager (0) can see anything requiring Officer (2) because 0 <= 2.
        return userTierOrder <= Math.max(...requiredOrders);
    }

    return false;
};

const canAccessScopedEntity = (entity, userContext, referenceDate = new Date()) => {
    if (!entity) {
        return true;
    }

    if (!isTemporaryEntityVisible(entity, referenceDate)) {
        return false;
    }

    if (userContext?.role === 'admin') {
        return true;
    }

    if (entity.visibleToAll) {
        return true;
    }

    return canAccessByDepartment(entity, userContext) && canAccessByTierHierarchy(entity, userContext);
};

const canAccessCourse = (course, userContext, referenceDate = new Date()) => {
    const category = course?.category;
    return canAccessScopedEntity(category, userContext, referenceDate) && canAccessScopedEntity(course, userContext, referenceDate);
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
    const referenceDate = new Date();
    const courses = await prisma.course.findMany({
        where: buildCourseVisibilityWhere(userContext, referenceDate),
        orderBy: [
            { isTemporary: 'desc' },
            { createdAt: 'desc' }
        ],
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
        .filter((course) => canAccessCourse(course, userContext, referenceDate))
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
    const referenceDate = new Date();
    const course = await prisma.course.findFirst({
        where: {
            id: courseId,
            ...buildCourseVisibilityWhere(userContext, referenceDate)
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

    if (!course || !canAccessCourse(course, userContext, referenceDate)) {
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
            contentUrl: isProtectedDocumentLesson(lesson) ? null : lesson.contentUrl,
            hasDocument: isProtectedDocumentLesson(lesson),
            progress: lesson.progress[0] || null,
            isCompleted: lesson.progress[0]?.progress === 100,
            bestScore: lesson.quizAttempts[0]?.score || null,
            questionCount: lesson._count?.questions || 0,
            _count: undefined,
            quizAttempts: undefined
        }))
    };
};

const getLessonDocumentAccess = async (userId, lessonId) => {
    const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        select: {
            id: true,
            courseId: true,
            type: true,
            contentUrl: true
        }
    });

    if (!lesson) {
        throw new ErrorResponse('Lesson not found', 404);
    }

    if (!isProtectedDocumentLesson(lesson)) {
        throw new ErrorResponse('Document not found for this lesson', 404);
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
        throw new ErrorResponse('You must enroll before opening this document', 403);
    }

    const token = createDocumentAccessToken({
        userId,
        lessonId: lesson.id,
        contentUrl: lesson.contentUrl
    });
    const previewMeta = getDocumentPreviewMeta(lesson.contentUrl);

    return {
        lessonId: lesson.id,
        accessUrl: `/api/user/lessons/${lesson.id}/document-stream?token=${encodeURIComponent(token)}`,
        expiresIn: DOCUMENT_ACCESS_TOKEN_TTL_SECONDS,
        ...previewMeta
    };
};

const getLessonDocumentStream = async (lessonId, token) => {
    const documentAccessPayload = verifyDocumentAccessToken(token, lessonId);
    return getDocumentUpstreamResponse(documentAccessPayload);
};

const enrollCourse = async (userId, courseId) => {
    const userContext = await getVisibleCourseQuery(userId);
    const referenceDate = new Date();
    const course = await prisma.course.findFirst({
        where: {
            id: courseId,
            ...buildCourseVisibilityWhere(userContext, referenceDate)
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

    if (!course || !canAccessCourse(course, userContext, referenceDate)) {
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
    const referenceDate = new Date();
    const categories = await prisma.category.findMany({
        where: buildCategoryVisibilityWhere(userContext, referenceDate),
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
        orderBy: [
            { isTemporary: 'desc' },
            { order: 'asc' }
        ]
    });

    return categories
        .filter((category) => canAccessScopedEntity(category, userContext, referenceDate))
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
    getLessonQuestions,
    getLessonDocumentAccess,
    getLessonDocumentStream
};
