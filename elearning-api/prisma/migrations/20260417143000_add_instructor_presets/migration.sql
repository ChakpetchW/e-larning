CREATE TABLE "InstructorPreset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "avatar" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstructorPreset_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Course" ADD COLUMN "instructorPresetId" TEXT;

CREATE INDEX "InstructorPreset_name_idx" ON "InstructorPreset"("name");

ALTER TABLE "Course" ADD CONSTRAINT "Course_instructorPresetId_fkey" FOREIGN KEY ("instructorPresetId") REFERENCES "InstructorPreset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
