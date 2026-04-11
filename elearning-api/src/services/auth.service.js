const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authHelpers = require('../utils/auth.helpers');

const mapPublicUser = authHelpers.mapUserRecord;

const login = async (email, password) => {
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            departmentRef: true,
            tier: true
        }
    });

    if (!user) {
        throw new Error('อีเมล หรือ รหัสผ่านไม่ถูกต้อง');
    }

    if (user.status !== 'ACTIVE') {
        throw new Error('บัญชีนี้ถูกระงับการใช้งาน');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        throw new Error('อีเมล หรือ รหัสผ่านไม่ถูกต้อง');
    }

    const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    return {
        token,
        user: mapPublicUser(user)
    };
};

const getCurrentUser = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            departmentRef: true,
            tier: true
        }
    });

    if (!user) {
        throw new Error('User not found');
    }

    return mapPublicUser(user);
};

module.exports = {
    login,
    getCurrentUser
};
