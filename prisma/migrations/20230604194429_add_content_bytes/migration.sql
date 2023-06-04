-- AlterTable
ALTER TABLE "Registrant" ALTER COLUMN "createdAt" SET DEFAULT now();

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT now();

-- AlterTable
ALTER TABLE "WaitingRoom" ADD COLUMN     "content" BYTES NOT NULL DEFAULT '\x';
ALTER TABLE "WaitingRoom" ALTER COLUMN "createdAt" SET DEFAULT now();
