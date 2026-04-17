const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
  try {
    const leadership = await prisma.category.updateMany({
      where: { type: 'LEADERSHIP' },
      data: { type: 'GOAL_PATH' }
    });
    const functionType = await prisma.category.updateMany({
      where: { type: 'FUNCTION' },
      data: { type: 'KM_COURSE' }
    });
    const innovation = await prisma.category.updateMany({
      where: { type: 'INNOVATION' },
      data: { type: 'LEARNING_ASSESS' }
    });
    console.log('Migration completed:', {
      leadership: leadership.count,
      function: functionType.count,
      innovation: innovation.count
    });
  } catch (e) {
    console.error('Migration failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
