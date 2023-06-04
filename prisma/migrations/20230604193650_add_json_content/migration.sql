-- AlterTable
ALTER TABLE "Registrant" ALTER COLUMN "createdAt" SET DEFAULT now();

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT now();

-- AlterTable
ALTER TABLE "WaitingRoom" ADD COLUMN     "content" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "WaitingRoom" ALTER COLUMN "createdAt" SET DEFAULT now();
