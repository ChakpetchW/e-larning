// Production seed - runs on every server start to ensure admin account exists
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seedProduction() {
  try {
    // Upsert admin user with production credentials
    const hash = await bcrypt.hash('Genjironan.1', 10);
    await prisma.user.upsert({
      where: { email: 'chakpetch@scaleup.co.th' },
      update: { password: hash, name: 'Chakpetch', role: 'admin' },
      create: {
        name: 'Chakpetch',
        email: 'chakpetch@scaleup.co.th',
        password: hash,
        role: 'admin',
        status: 'ACTIVE'
      }
    });

    // Ensure default categories exist
    await prisma.category.upsert({ where: { name: 'Compliance' }, update: {}, create: { name: 'Compliance', order: 1 } });
    await prisma.category.upsert({ where: { name: 'Soft Skills' }, update: {}, create: { name: 'Soft Skills', order: 2 } });
    await prisma.category.upsert({ where: { name: 'Hard Skills' }, update: {}, create: { name: 'Hard Skills', order: 3 } });

    console.log('[Seed] Admin and categories ensured OK');
  } catch (err) {
    console.error('[Seed] Error during seed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = seedProduction;
