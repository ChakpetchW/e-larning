const prisma = require('./src/utils/prisma');

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ DB CONNECTED OK');
    const count = await prisma.user.count();
    console.log('User count:', count);
  } catch (e) {
    console.error('❌ DB ERROR:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
