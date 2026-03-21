const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany();
  console.log("Categories:", JSON.stringify(categories, null, 2));
  
  const courses = await prisma.course.findMany({
    include: { category: true }
  });
  console.log("Courses count:", courses.length);

  const users = await prisma.user.findMany();
  console.log("Users:", JSON.stringify(users.map(u => ({ email: u.email, id: u.id, role: u.role })), null, 2));
}

main().finally(() => prisma.$disconnect());
