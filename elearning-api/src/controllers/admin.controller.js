const AdminService = require('../services/admin.service');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// DASHBOARD
const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await AdminService.getDashboardStats(req.user);
  res.json({ success: true, data: stats });
});

// USERS
const getUsers = asyncHandler(async (req, res) => {
  const users = await AdminService.getUsers(req.user);
  res.json({ success: true, data: users });
});

const getUserDetails = asyncHandler(async (req, res) => {
  const user = await AdminService.getUserDetails(req.params.id, req.user);
  res.json({ success: true, data: user });
});

const createUser = asyncHandler(async (req, res) => {
  const user = await AdminService.createUser(req.body);
  res.status(201).json({ success: true, data: user });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await AdminService.updateUser(req.params.id, req.body);
  res.json({ success: true, data: user });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (req.user.userId === id) {
    throw new ErrorResponse('Cannot delete your own account', 400);
  }
  await AdminService.deleteUser(id);
  res.json({ success: true, message: 'User deleted successfully' });
});

// DEPARTMENTS
const getDepartments = asyncHandler(async (req, res) => {
  const departments = await AdminService.getDepartments(req.user);
  res.json({ success: true, data: departments });
});

const createDepartment = asyncHandler(async (req, res) => {
  const department = await AdminService.createDepartment(req.body);
  res.status(201).json({ success: true, data: department });
});

const updateDepartment = asyncHandler(async (req, res) => {
  const department = await AdminService.updateDepartment(req.params.id, req.body);
  res.json({ success: true, data: department });
});

const deleteDepartment = asyncHandler(async (req, res) => {
  await AdminService.deleteDepartment(req.params.id);
  res.json({ success: true, message: 'Department deleted successfully' });
});

// TIERS
const getTiers = asyncHandler(async (req, res) => {
  const tiers = await AdminService.getTiers(req.user);
  res.json({ success: true, data: tiers });
});

const createTier = asyncHandler(async (req, res) => {
  const tier = await AdminService.createTier(req.body);
  res.status(201).json({ success: true, data: tier });
});

const updateTier = asyncHandler(async (req, res) => {
  const tier = await AdminService.updateTier(req.params.id, req.body);
  res.json({ success: true, data: tier });
});

const deleteTier = asyncHandler(async (req, res) => {
  await AdminService.deleteTier(req.params.id);
  res.json({ success: true, message: 'Tier deleted successfully' });
});

const reorderTiers = asyncHandler(async (req, res) => {
  const { tierIds } = req.body;
  await AdminService.reorderTiers(tierIds);
  res.json({ success: true, message: 'Tiers reordered successfully' });
});


// COURSES
const getAdminCourses = asyncHandler(async (req, res) => {
  const courses = await AdminService.getAdminCourses();
  res.json({ success: true, data: courses });
});

const createCourse = asyncHandler(async (req, res) => {
  const course = await AdminService.createCourse(req.body);
  res.status(201).json({ success: true, data: course });
});

const updateCourse = asyncHandler(async (req, res) => {
  const course = await AdminService.updateCourse(req.params.id, req.body);
  res.json({ success: true, data: course });
});

const deleteCourse = asyncHandler(async (req, res) => {
  await AdminService.deleteCourse(req.params.id);
  res.json({ success: true, message: 'Course deleted' });
});

// CATEGORIES
const getCategories = asyncHandler(async (req, res) => {
  const categories = await AdminService.getCategories();
  res.json({ success: true, data: categories });
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await AdminService.createCategory(req.body);
  res.status(201).json({ success: true, data: category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await AdminService.updateCategory(req.params.id, req.body);
  res.json({ success: true, data: category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  await AdminService.deleteCategory(req.params.id);
  res.json({ success: true, message: 'Category deleted' });
});

const reorderCategories = asyncHandler(async (req, res) => {
  await AdminService.reorderCategories(req.body.categoryIds);
  res.json({ success: true, message: 'Categories reordered successfully' });
});

// REWARDS
const getAdminRewards = asyncHandler(async (req, res) => {
  const rewards = await AdminService.getAdminRewards();
  res.json({ success: true, data: rewards });
});

const createReward = asyncHandler(async (req, res) => {
  const reward = await AdminService.createReward(req.body);
  res.status(201).json({ success: true, data: reward });
});

const updateReward = asyncHandler(async (req, res) => {
  const reward = await AdminService.updateReward(req.params.id, req.body);
  res.json({ success: true, data: reward });
});

const deleteReward = asyncHandler(async (req, res) => {
  await AdminService.deleteReward(req.params.id);
  res.json({ success: true, message: 'Reward deleted' });
});

// REDEMPTIONS
const getRedeemRequests = asyncHandler(async (req, res) => {
  const requests = await AdminService.getRedeemRequests();
  res.json({ success: true, data: requests });
});

const updateRedeemStatus = asyncHandler(async (req, res) => {
  const { status, adminNote } = req.body;
  if (!['APPROVED', 'REJECTED', 'FULFILLED'].includes(status)) {
    throw new ErrorResponse('Invalid status', 400);
  }
  await AdminService.updateRedeemStatus(req.params.id, status, adminNote);
  res.json({ success: true, message: `Request ${status}` });
});

// LESSONS
const getCourseLessons = asyncHandler(async (req, res) => {
  const lessons = await AdminService.getCourseLessons(req.params.courseId);
  res.json({ success: true, data: lessons });
});

const createLesson = asyncHandler(async (req, res) => {
  const lesson = await AdminService.createLesson(req.body);
  res.status(201).json({ success: true, data: lesson });
});

const updateLesson = asyncHandler(async (req, res) => {
  const lesson = await AdminService.updateLesson(req.params.id, req.body);
  res.json({ success: true, data: lesson });
});

const deleteLesson = asyncHandler(async (req, res) => {
  await AdminService.deleteLesson(req.params.id);
  res.json({ success: true, message: 'Lesson deleted' });
});

const reorderLessons = asyncHandler(async (req, res) => {
  const { lessonIds } = req.body;
  await AdminService.reorderLessons(lessonIds);
  res.json({ success: true, message: 'Lessons reordered successfully' });
});

// QUIZ REPORTS
const getCourseQuizAttempts = asyncHandler(async (req, res) => {
  const attempts = await AdminService.getCourseQuizAttempts(req.params.courseId);
  res.json({ success: true, data: attempts });
});

module.exports = {
  getDashboardStats,
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
  reorderTiers,
  getCourseLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  getCourseQuizAttempts
};
