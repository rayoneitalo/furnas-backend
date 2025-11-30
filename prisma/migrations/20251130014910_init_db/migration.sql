-- CreateEnum
CREATE TYPE "PlayerProfile" AS ENUM ('LINHA', 'GOLEIRO', 'RESENHA');

-- CreateEnum
CREATE TYPE "ListStatus" AS ENUM ('MAIN', 'WAITLIST');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'USED', 'EXPIRED');

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rg" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "profile" "PlayerProfile" NOT NULL,
    "status" "ListStatus" NOT NULL,
    "joinTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isGuest" BOOLEAN NOT NULL DEFAULT false,
    "invitedByPlayerId" TEXT,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "invitedByPlayerId" TEXT,
    "invitedByUserId" TEXT NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "acceptedPlayerId" TEXT,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "Player_rg_key" ON "Player"("rg");

-- CreateIndex
CREATE INDEX "Player_status_joinTimestamp_idx" ON "Player"("status", "joinTimestamp");

-- CreateIndex
CREATE INDEX "Player_rg_idx" ON "Player"("rg");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_token_key" ON "Invite"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_acceptedPlayerId_key" ON "Invite"("acceptedPlayerId");

-- CreateIndex
CREATE INDEX "Invite_invitedByUserId_idx" ON "Invite"("invitedByUserId");

-- CreateIndex
CREATE INDEX "Invite_status_expiresAt_idx" ON "Invite"("status", "expiresAt");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_invitedByPlayerId_fkey" FOREIGN KEY ("invitedByPlayerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_invitedByPlayerId_fkey" FOREIGN KEY ("invitedByPlayerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_acceptedPlayerId_fkey" FOREIGN KEY ("acceptedPlayerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
