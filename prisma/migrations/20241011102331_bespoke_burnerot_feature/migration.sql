-- CreateEnum
CREATE TYPE "Burnerot" AS ENUM ('Yarden', 'Yeruham');

-- AlterTable
ALTER TABLE "Registrant" ADD COLUMN     "burnerot" "Burnerot";
ALTER TABLE "Registrant" ALTER COLUMN "createdAt" SET DEFAULT now();

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT now();

-- AlterTable
ALTER TABLE "WaitingRoom" ALTER COLUMN "createdAt" SET DEFAULT now();
