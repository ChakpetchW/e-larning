const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken); // All user routes require authentication

router.get('/courses', userController.getCourses);
router.get('/courses/:id', userController.getCourseDetails);
router.post('/courses/:id/enroll', userController.enrollCourse);

router.put('/lessons/:id/progress', userController.updateLessonProgress);
router.post('/lessons/:id/quiz', userController.submitQuiz);
router.get('/points', userController.getPointsHistory);
router.get('/rewards', userController.getRewards);
router.get('/categories', userController.getCategories);
router.post('/redeem/:id', userController.requestRedeem);
router.put('/profile', userController.updateProfile);

module.exports = router;
