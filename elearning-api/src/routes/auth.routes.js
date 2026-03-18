const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth');

router.post('/login', authController.login);
router.get('/me', verifyToken, authController.getCurrentUser);

module.exports = router;
