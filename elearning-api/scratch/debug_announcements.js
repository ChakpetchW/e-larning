const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const announcements = await prisma.announcement.findMany({
      include: {
        department: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        questions: {
          include: {
            choices: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    });
    console.log('Successfully fetched announcements:', announcements.length);
  } catch (err) {
    console.error('Error fetching announcements:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
