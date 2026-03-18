const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany();
  console.log("Categories:", JSON.stringify(categories, null, 2));
  
  const courses = await prisma.course.findMany({
    include: { category: true }
  });
  console.log("Courses:", JSON.stringify(courses, null, 2));
}

main().finally(() => prisma.$disconnect());
