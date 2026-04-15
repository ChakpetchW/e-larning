const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken, verifyAdmin, verifySuperAdmin, verifyAdminPanelAccess } = require('../middleware/auth');

router.use(verifyToken, verifyAdminPanelAccess); // Admin + manager can access the admin panel

router.get('/dashboard', adminController.getDashboardStats);

router.get('/users', adminController.getUsers);
router.get('/users/:id/details', adminController.getUserDetails);
router.post('/users', verifySuperAdmin, adminController.createUser);
router.put('/users/:id', verifySuperAdmin, adminController.updateUser);
router.delete('/users/:id', verifySuperAdmin, adminController.deleteUser);

router.get('/departments', adminController.getDepartments);
router.post('/departments', verifySuperAdmin, adminController.createDepartment);
router.put('/departments/:id', verifySuperAdmin, adminController.updateDepartment);
router.delete('/departments/:id', verifySuperAdmin, adminController.deleteDepartment);

router.get('/tiers', adminController.getTiers);
router.post('/tiers', verifySuperAdmin, adminController.createTier);
router.put('/tiers/reorder', verifySuperAdmin, adminController.reorderTiers);
router.put('/tiers/:id', verifySuperAdmin, adminController.updateTier);
router.delete('/tiers/:id', verifySuperAdmin, adminController.deleteTier);

router.get('/courses', adminController.getAdminCourses);
router.post('/courses', adminController.createCourse);
router.put('/courses/:id/republish', adminController.republishCourse);
router.put('/courses/:id', adminController.updateCourse);
router.delete('/courses/:id', adminController.deleteCourse);

router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/reorder', adminController.reorderCategories);
router.put('/categories/:id/republish', adminController.republishCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

router.get('/rewards', verifySuperAdmin, adminController.getAdminRewards);
router.post('/rewards', verifySuperAdmin, adminController.createReward);
router.put('/rewards/:id', verifySuperAdmin, adminController.updateReward);
router.delete('/rewards/:id', verifySuperAdmin, adminController.deleteReward);

router.get('/redeems', adminController.getRedeemRequests);
router.put('/redeems/:id/status', adminController.updateRedeemStatus);

// Lesson Management
router.get('/courses/:courseId/lessons', adminController.getCourseLessons);
router.put('/lessons/reorder', adminController.reorderLessons);
router.post('/lessons', adminController.createLesson);
router.put('/lessons/:id', adminController.updateLesson);
router.delete('/lessons/:id', adminController.deleteLesson);

// Quiz Reports
router.get('/courses/:courseId/quiz-reports', adminController.getCourseQuizAttempts);

module.exports = router;
