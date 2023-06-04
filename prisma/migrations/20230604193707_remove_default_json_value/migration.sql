-- AlterTable
ALTER TABLE "Registrant" ALTER COLUMN "createdAt" SET DEFAULT now();

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT now();

-- AlterTable
ALTER TABLE "WaitingRoom" ALTER COLUMN "createdAt" SET DEFAULT now();
ALTER TABLE "WaitingRoom" ALTER COLUMN "content" DROP DEFAULT;
