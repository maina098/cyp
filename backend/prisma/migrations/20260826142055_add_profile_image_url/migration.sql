-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "constituency" TEXT,
ADD COLUMN     "county" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "profileImageUrl" TEXT;

-- CreateTable
CREATE TABLE "UserEventParticipation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "mediaUrl" TEXT,
    "mediaType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserEventParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserContentRead" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserContentRead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityService" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "mediaType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserEventParticipation_userId_createdAt_idx" ON "UserEventParticipation"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "UserEventParticipation_eventId_idx" ON "UserEventParticipation"("eventId");

-- CreateIndex
CREATE INDEX "UserContentRead_userId_readAt_idx" ON "UserContentRead"("userId", "readAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserContentRead_userId_contentType_contentId_key" ON "UserContentRead"("userId", "contentType", "contentId");

-- CreateIndex
CREATE INDEX "CommunityService_userId_createdAt_idx" ON "CommunityService"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CommunityService_status_idx" ON "CommunityService"("status");

-- AddForeignKey
ALTER TABLE "UserEventParticipation" ADD CONSTRAINT "UserEventParticipation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEventParticipation" ADD CONSTRAINT "UserEventParticipation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserContentRead" ADD CONSTRAINT "UserContentRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityService" ADD CONSTRAINT "CommunityService_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
