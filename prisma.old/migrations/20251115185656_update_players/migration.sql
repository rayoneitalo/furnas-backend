/*
  Warnings:

  - A unique constraint covering the columns `[rg]` on the table `Player` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phone` to the `Player` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rg` to the `Player` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "rg" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Player_rg_key" ON "Player"("rg");

-- CreateIndex
CREATE INDEX "Player_rg_idx" ON "Player"("rg");
