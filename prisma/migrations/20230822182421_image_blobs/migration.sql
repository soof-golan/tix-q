-- AlterTable
ALTER TABLE "Registrant" ALTER COLUMN "createdAt" SET DEFAULT now();

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT now();

-- AlterTable
ALTER TABLE "WaitingRoom" ADD COLUMN     "desktopImageBlob" STRING;
ALTER TABLE "WaitingRoom" ADD COLUMN     "mobileImageBlob" STRING;
ALTER TABLE "WaitingRoom" ALTER COLUMN "createdAt" SET DEFAULT now();
