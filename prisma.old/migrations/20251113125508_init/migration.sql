-- CreateEnum
CREATE TYPE "PlayerProfile" AS ENUM ('LINHA', 'GOLEIRO', 'RESENHA');

-- CreateEnum
CREATE TYPE "ListStatus" AS ENUM ('MAIN', 'WAITLIST');

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profile" "PlayerProfile" NOT NULL,
    "status" "ListStatus" NOT NULL,
    "joinTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isGuest" BOOLEAN NOT NULL DEFAULT false,
    "invitedByPlayerId" TEXT,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListState" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "listOpenTimestamp" TIMESTAMP(3) NOT NULL,
    "listResetCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ListState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_userId_key" ON "Player"("userId");

-- CreateIndex
CREATE INDEX "Player_status_joinTimestamp_idx" ON "Player"("status", "joinTimestamp");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_invitedByPlayerId_fkey" FOREIGN KEY ("invitedByPlayerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
