const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken, verifyAdmin, verifyAdminPanelAccess } = require('../middleware/auth');

router.use(verifyToken, verifyAdminPanelAccess); // Admin + manager can access the admin panel

router.get('/dashboard', adminController.getDashboardStats);

router.get('/users', adminController.getUsers);
router.get('/users/:id/details', adminController.getUserDetails);
router.post('/users', verifyAdmin, adminController.createUser);
router.put('/users/:id', verifyAdmin, adminController.updateUser);
router.delete('/users/:id', verifyAdmin, adminController.deleteUser);

router.get('/departments', adminController.getDepartments);
router.post('/departments', verifyAdmin, adminController.createDepartment);
router.put('/departments/:id', verifyAdmin, adminController.updateDepartment);
router.delete('/departments/:id', verifyAdmin, adminController.deleteDepartment);

router.get('/tiers', adminController.getTiers);
router.post('/tiers', verifyAdmin, adminController.createTier);
router.put('/tiers/:id', verifyAdmin, adminController.updateTier);
router.delete('/tiers/:id', verifyAdmin, adminController.deleteTier);

router.get('/courses', verifyAdmin, adminController.getAdminCourses);
router.post('/courses', verifyAdmin, adminController.createCourse);
router.put('/courses/:id', verifyAdmin, adminController.updateCourse);
router.delete('/courses/:id', verifyAdmin, adminController.deleteCourse);

router.get('/categories', verifyAdmin, adminController.getCategories);
router.post('/categories', verifyAdmin, adminController.createCategory);
router.put('/categories/reorder', verifyAdmin, adminController.reorderCategories);
router.put('/categories/:id', verifyAdmin, adminController.updateCategory);
router.delete('/categories/:id', verifyAdmin, adminController.deleteCategory);

router.get('/rewards', verifyAdmin, adminController.getAdminRewards);
router.post('/rewards', verifyAdmin, adminController.createReward);
router.put('/rewards/:id', verifyAdmin, adminController.updateReward);
router.delete('/rewards/:id', verifyAdmin, adminController.deleteReward);

router.get('/redeems', verifyAdmin, adminController.getRedeemRequests);
router.put('/redeems/:id/status', verifyAdmin, adminController.updateRedeemStatus);

// Lesson Management
router.get('/courses/:courseId/lessons', verifyAdmin, adminController.getCourseLessons);
router.put('/lessons/reorder', verifyAdmin, adminController.reorderLessons);
router.post('/lessons', verifyAdmin, adminController.createLesson);
router.put('/lessons/:id', verifyAdmin, adminController.updateLesson);
router.delete('/lessons/:id', verifyAdmin, adminController.deleteLesson);

// Quiz Reports
router.get('/courses/:courseId/quiz-reports', verifyAdmin, adminController.getCourseQuizAttempts);

module.exports = router;
