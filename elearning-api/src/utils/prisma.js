const { PrismaClient } = require('@prisma/client');

const prismaOptions = {
  log: process.env.NODE_ENV === 'development'
    ? ['warn', 'error']
    : ['error'],
};

// Singleton pattern — prevents connection leaks in dev (nodemon restarts)
const globalForPrisma = globalThis;
const prisma = globalForPrisma.__prisma || new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = prisma;
}

module.exports = prisma;
