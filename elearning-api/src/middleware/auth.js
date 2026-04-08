const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Superadmin access required' });
  }
};

const verifySuperAdmin = verifyAdmin;

const prisma = require('../utils/prisma');

const verifyAdminPanelAccess = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { tier: true }
    });

    if (user && (['admin', 'manager'].includes(user.role) || user.tier?.accessAdmin)) {
      // Update req.user with latest data for downstream use
      req.user.role = user.role;
      req.user.tier = user.tier;
      next();
    } else {
      res.status(403).json({ message: 'Admin panel access required' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error verifying permissions' });
  }
};

module.exports = {
  verifyToken,
  verifyAdmin,
  verifySuperAdmin,
  verifyAdminPanelAccess
};
