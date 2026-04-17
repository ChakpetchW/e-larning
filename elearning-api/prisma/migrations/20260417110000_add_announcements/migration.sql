CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "type" TEXT NOT NULL,
    "contentUrl" TEXT,
    "content" TEXT,
    "duration" TEXT,
    "passScore" INTEGER,
    "departmentId" TEXT NOT NULL,
    "createdById" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "expiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AnnouncementQuestion" (
    "id" TEXT NOT NULL,
    "announcementId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "AnnouncementQuestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AnnouncementChoice" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AnnouncementChoice_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AnnouncementQuestion" ADD CONSTRAINT "AnnouncementQuestion_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AnnouncementChoice" ADD CONSTRAINT "AnnouncementChoice_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "AnnouncementQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "Announcement_departmentId_idx" ON "Announcement"("departmentId");
CREATE INDEX "Announcement_createdAt_idx" ON "Announcement"("createdAt");
CREATE INDEX "Announcement_expiredAt_idx" ON "Announcement"("expiredAt");
CREATE INDEX "AnnouncementQuestion_announcementId_idx" ON "AnnouncementQuestion"("announcementId");
