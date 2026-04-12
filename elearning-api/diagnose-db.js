require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function testConnections() {
  console.log('--- Database Connection Test ---');
  
  // Test Pooler (6543)
  const prismaPooler = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } }
  });
  
  try {
    console.log('Testing Pooler Connection (6543)...');
    await prismaPooler.$connect();
    const userCount = await prismaPooler.user.count();
    console.log('✅ Pooler Success! User count:', userCount);
  } catch (err) {
    console.error('❌ Pooler Failed:', err.message);
  } finally {
    await prismaPooler.$disconnect();
  }

  console.log('\n--------------------------------\n');

  // Test Direct (5432)
  const prismaDirect = new PrismaClient({
    datasources: { db: { url: process.env.DIRECT_URL } }
  });
  
  try {
    console.log('Testing Direct Connection (5432)...');
    await prismaDirect.$connect();
    const userCount = await prismaDirect.user.count();
    console.log('✅ Direct Success! User count:', userCount);
  } catch (err) {
    console.error('❌ Direct Failed:', err.message);
  } finally {
    await prismaDirect.$disconnect();
  }
}

testConnections();
