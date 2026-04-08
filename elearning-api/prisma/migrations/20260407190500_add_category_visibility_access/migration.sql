-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "visibleToAll" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "CategoryDepartmentAccess" (
    "categoryId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CategoryDepartmentAccess_pkey" PRIMARY KEY ("categoryId","departmentId")
);

-- CreateTable
CREATE TABLE "CategoryTierAccess" (
    "categoryId" TEXT NOT NULL,
    "tierId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CategoryTierAccess_pkey" PRIMARY KEY ("categoryId","tierId")
);

-- AddForeignKey
ALTER TABLE "CategoryDepartmentAccess" ADD CONSTRAINT "CategoryDepartmentAccess_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryDepartmentAccess" ADD CONSTRAINT "CategoryDepartmentAccess_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryTierAccess" ADD CONSTRAINT "CategoryTierAccess_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryTierAccess" ADD CONSTRAINT "CategoryTierAccess_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "Tier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
