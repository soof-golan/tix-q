-- AlterTable
ALTER TABLE "Registrant" ADD COLUMN     "turnstileFailReason" STRING;
ALTER TABLE "Registrant" ALTER COLUMN "createdAt" SET DEFAULT now();

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT now();

-- AlterTable
ALTER TABLE "WaitingRoom" ALTER COLUMN "createdAt" SET DEFAULT now();
