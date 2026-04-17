const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  try {
    const counts = await prisma.category.groupBy({
      by: ['type'],
      _count: { id: true }
    });
    console.log('Categories by new Module types:', JSON.stringify(counts, null, 2));
  } catch (e) {
    console.error('Verification failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
