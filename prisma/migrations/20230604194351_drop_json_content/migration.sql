/*
  Warnings:

  - You are about to drop the column `content` on the `WaitingRoom` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Registrant" ALTER COLUMN "createdAt" SET DEFAULT now();

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT now();

-- AlterTable
ALTER TABLE "WaitingRoom" DROP COLUMN "content";
ALTER TABLE "WaitingRoom" ALTER COLUMN "createdAt" SET DEFAULT now();
