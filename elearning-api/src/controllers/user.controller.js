const UserService = require('../services/user.service');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// Get all courses (with enrollment status if applicable)
const getCourses = asyncHandler(async (req, res) => {
  const courses = await UserService.getCourses(req.user.userId);
  res.json({ success: true, data: courses });
});

// Update user profile
const updateProfile = asyncHandler(async (req, res) => {
  const updatedUser = await UserService.updateProfile(req.user.userId, req.body);
  res.json({ success: true, data: updatedUser });
});

// Get single course details
const getCourseDetails = asyncHandler(async (req, res) => {
  const course = await UserService.getCourseDetails(req.params.id, req.user.userId);
  if (!course) {
    throw new ErrorResponse('Course not found', 404);
  }
  res.json({ success: true, data: course });
});

// Enroll in a course
const enrollCourse = asyncHandler(async (req, res) => {
  const enrollment = await UserService.enrollCourse(req.user.userId, req.params.id);
  res.status(201).json({ success: true, message: 'Successfully enrolled', data: enrollment });
});

// Update lesson progress and handle points
const updateLessonProgress = asyncHandler(async (req, res) => {
  const progress = await UserService.updateLessonProgress(req.user.userId, req.params.id, req.body.progress);
  res.json({ success: true, message: 'Progress updated', data: progress });
});

// Submit Quiz Answers
const submitQuiz = asyncHandler(async (req, res) => {
  const result = await UserService.submitQuiz(req.user.userId, req.params.id, req.body.answers);
  res.json({ success: true, data: result });
});

// Get user points balance and history
const getPointsHistory = asyncHandler(async (req, res) => {
  const data = await UserService.getPointsHistory(req.user.userId);
  res.json({ success: true, data: data });
});

// Get rewards catalog
const getRewards = asyncHandler(async (req, res) => {
  const data = await UserService.getRewardsData(req.user.userId);
  res.json({ success: true, data: data });
});

// Redeem a reward
const requestRedeem = asyncHandler(async (req, res) => {
  const request = await UserService.requestRedeem(req.user.userId, req.params.id);
  res.status(201).json({ success: true, message: 'Redeem request submitted successfully', data: request });
});

// Get all categories for filtering
const getCategories = asyncHandler(async (req, res) => {
  const categories = await UserService.getCategories(req.user.userId);
  res.json({ success: true, data: categories });
});

// Get quiz questions for a specific lesson
const getLessonQuestions = asyncHandler(async (req, res) => {
  const questions = await UserService.getLessonQuestions(req.params.id);
  res.json({ success: true, data: questions });
});

module.exports = {
  getCourses,
  getCourseDetails,
  enrollCourse,
  updateLessonProgress,
  getPointsHistory,
  getRewards,
  requestRedeem,
  getCategories,
  submitQuiz,
  updateProfile,
  getLessonQuestions
};
