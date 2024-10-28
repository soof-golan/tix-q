-- AlterTable
ALTER TABLE "Registrant" ALTER COLUMN "createdAt" SET DEFAULT now();

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT now();

-- AlterTable
ALTER TABLE "WaitingRoom" ALTER COLUMN "createdAt" SET DEFAULT now();

-- CreateIndex
CREATE INDEX "Registrant_waitingRoomId_turnstileTimestamp_idx" ON "Registrant"("waitingRoomId", "turnstileTimestamp" ASC);

-- CreateIndex
CREATE INDEX "WaitingRoom_ownerId_idx" ON "WaitingRoom"("ownerId");
