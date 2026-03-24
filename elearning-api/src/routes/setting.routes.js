const express = require('express');
const router = express.Router();
const settingController = require('../controllers/setting.controller');
const { auth, adminOnly } = require('../middleware/auth.middleware');

// Public settings (for all logged in users)
router.get('/', auth, settingController.getSettings);

// Admin only settings update
router.patch('/:key', auth, adminOnly, settingController.updateSetting);

module.exports = router;
