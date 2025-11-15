-- Remove RESENHA from ListStatus enum
-- First, update any players with RESENHA status to MAIN (they should be filtered by profile anyway)
UPDATE "Player" SET status = 'MAIN' WHERE status = 'RESENHA';

-- Remove RESENHA from the enum
ALTER TYPE "ListStatus" RENAME TO "ListStatus_old";
CREATE TYPE "ListStatus" AS ENUM ('MAIN', 'WAITLIST');
ALTER TABLE "Player" ALTER COLUMN status TYPE "ListStatus" USING status::text::"ListStatus";
DROP TYPE "ListStatus_old";