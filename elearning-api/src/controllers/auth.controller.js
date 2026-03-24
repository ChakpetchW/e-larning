const AuthService = require('../services/auth.service');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await AuthService.login(email, password);
  res.json({ success: true, data: result });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await AuthService.getCurrentUser(req.user.userId);
  if (!user) {
    throw new ErrorResponse('User not found', 404);
  }
  res.json({ success: true, data: user });
});

module.exports = {
  login,
  getCurrentUser
};
