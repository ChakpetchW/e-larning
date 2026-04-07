const express = require('express');
const router = express.Router();
const settingController = require('../controllers/setting.controller');
const { verifyToken, verifyAdminPanelAccess } = require('../middleware/auth');

// Public settings (for all logged in users)
router.get('/', verifyToken, settingController.getSettings);

// Admin panel settings update
router.patch('/:key', verifyToken, verifyAdminPanelAccess, settingController.updateSetting);

module.exports = router;
