const { PrismaClient } = require('@prisma/client');

const prismaOptions = {
  log: process.env.NODE_ENV === 'development'
    ? ['warn', 'error']
    : ['error'],
};

// Singleton pattern — prevents connection leaks in dev (nodemon restarts)
const prisma = global.prisma || new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

module.exports = prisma;
