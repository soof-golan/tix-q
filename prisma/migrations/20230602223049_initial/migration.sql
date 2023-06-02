-- CreateEnum
CREATE TYPE "IdType" AS ENUM ('ID_CARD', 'PASSPORT');

-- CreateTable
CREATE TABLE "WaitingRoom" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "opensAt" TIMESTAMP(3) NOT NULL,
    "closesAt" TIMESTAMP(3) NOT NULL,
    "markdown" STRING NOT NULL,
    "title" STRING NOT NULL,
    "ownerId" UUID NOT NULL,

    CONSTRAINT "WaitingRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "firebaseUid" STRING NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registrant" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "legalName" STRING NOT NULL,
    "email" STRING NOT NULL,
    "idNumber" STRING NOT NULL,
    "idType" "IdType" NOT NULL,
    "phoneNumber" STRING NOT NULL,
    "turnstileSuccess" BOOL NOT NULL DEFAULT false,
    "turnstileTimestamp" TIMESTAMP(3),
    "waitingRoomId" UUID NOT NULL,

    CONSTRAINT "Registrant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User"("firebaseUid");

-- AddForeignKey
ALTER TABLE "WaitingRoom" ADD CONSTRAINT "WaitingRoom_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registrant" ADD CONSTRAINT "Registrant_waitingRoomId_fkey" FOREIGN KEY ("waitingRoomId") REFERENCES "WaitingRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
