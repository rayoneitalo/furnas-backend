-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'USED', 'EXPIRED');

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

-- CreateIndex
CREATE UNIQUE INDEX "Invite_token_key" ON "Invite"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_acceptedPlayerId_key" ON "Invite"("acceptedPlayerId");

-- CreateIndex
CREATE INDEX "Invite_invitedByUserId_idx" ON "Invite"("invitedByUserId");

-- CreateIndex
CREATE INDEX "Invite_status_expiresAt_idx" ON "Invite"("status", "expiresAt");

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_invitedByPlayerId_fkey" FOREIGN KEY ("invitedByPlayerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_acceptedPlayerId_fkey" FOREIGN KEY ("acceptedPlayerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
