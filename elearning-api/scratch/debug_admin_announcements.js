const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authHelpers = require('../src/utils/auth.helpers');

// Fill this with the actual userId from the user's report if possible, 
// or just find an admin/manager user in the DB.
async function test() {
  try {
    const user = await prisma.user.findFirst({
      where: {
        role: { in: ['admin', 'manager'] }
      }
    });

    if (!user) {
      console.log('No admin/manager user found for testing.');
      return;
    }

    console.log(`Testing with user: ${user.name} (Role: ${user.role}, Dept: ${user.departmentId})`);

    const authUser = { userId: user.id };
    const actor = await authHelpers.getActorContext(prisma, authUser);
    
    // The exact logic from admin.service.js
    const buildAnnouncementWhereForActor = (actor, extraWhere = {}) => (
        actor.isManager
            ? {
                departmentId: actor.departmentId,
                ...extraWhere
              }
            : extraWhere
    );

    const announcements = await prisma.announcement.findMany({
        where: buildAnnouncementWhereForActor(actor),
        include: {
            department: true,
            creator: {
                select: { id: true, name: true, email: true }
            },
            questions: {
                include: { choices: true },
                orderBy: { order: 'asc' }
            }
        },
        orderBy: [{ createdAt: 'desc' }]
    });

    console.log(`Success! Found ${announcements.length} announcements.`);
  } catch (err) {
    console.error('Error in getAdminAnnouncements logic:', err.message);
    if (err.stack) console.error(err.stack);
  } finally {
    await prisma.$disconnect();
  }
}

test();
