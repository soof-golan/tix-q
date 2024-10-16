/*
  Warnings:

  - You are about to drop the column `burnerot` on the `Registrant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Registrant" DROP COLUMN "burnerot";
ALTER TABLE "Registrant" ADD COLUMN     "eventChoice" STRING NOT NULL DEFAULT '';
ALTER TABLE "Registrant" ALTER COLUMN "createdAt" SET DEFAULT now();

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT now();

-- AlterTable
ALTER TABLE "WaitingRoom" ADD COLUMN     "eventChoices" STRING NOT NULL DEFAULT '';
ALTER TABLE "WaitingRoom" ALTER COLUMN "createdAt" SET DEFAULT now();
