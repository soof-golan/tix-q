-- AlterTable
ALTER TABLE "Registrant" ALTER COLUMN "createdAt" SET DEFAULT now();

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT now();

-- AlterTable
ALTER TABLE "WaitingRoom" ALTER COLUMN "createdAt" SET DEFAULT now();

-- CreateIndex
CREATE INDEX "User_firebaseUid_idx" ON "User"("firebaseUid");
