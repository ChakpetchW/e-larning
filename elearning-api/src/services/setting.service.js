const prisma = require('../utils/prisma');

const getSettings = async () => {
    const settings = await prisma.systemSetting.findMany();
    const settingsMap = {};
    settings.forEach(s => {
        settingsMap[s.key] = s.value;
    });
    
    // Default values if not set
    if (!settingsMap['weekly_goal']) settingsMap['weekly_goal'] = '1';
    
    return settingsMap;
};

const updateSetting = async (key, value) => {
    return await prisma.systemSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
    });
};

module.exports = {
    getSettings,
    updateSetting
};
