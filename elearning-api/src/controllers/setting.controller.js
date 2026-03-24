const SettingService = require('../services/setting.service');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

const getSettings = asyncHandler(async (req, res) => {
  const settingsMap = await SettingService.getSettings();
  res.json({ success: true, data: settingsMap });
});

const updateSetting = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  if (value === undefined) {
    throw new ErrorResponse('Value is required', 400);
  }

  const setting = await SettingService.updateSetting(key, value);
  res.json({ success: true, data: setting });
});

module.exports = {
  getSettings,
  updateSetting
};
