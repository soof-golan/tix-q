-- AlterTable
ALTER TABLE "Registrant" ALTER COLUMN "createdAt" SET DEFAULT now();

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT now();

-- AlterTable
ALTER TABLE "WaitingRoom" ADD COLUMN     "published" BOOL NOT NULL DEFAULT false;
ALTER TABLE "WaitingRoom" ALTER COLUMN "createdAt" SET DEFAULT now();
