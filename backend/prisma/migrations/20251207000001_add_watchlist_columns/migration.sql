-- Add missing columns to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "hasSelectedWatchlist" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastWatchlistChange" TIMESTAMP(3);

-- Update defaults for capital columns (10 million won)
ALTER TABLE "User" ALTER COLUMN "initialCapital" SET DEFAULT 10000000;
ALTER TABLE "User" ALTER COLUMN "currentCash" SET DEFAULT 10000000;

-- Update isActive default to false (requires admin approval)
ALTER TABLE "User" ALTER COLUMN "isActive" SET DEFAULT false;

-- Make capital columns nullable for ADMIN/TEACHER
ALTER TABLE "User" ALTER COLUMN "initialCapital" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "currentCash" DROP NOT NULL;

-- Add missing columns to Stock table
ALTER TABLE "Stock" ADD COLUMN IF NOT EXISTS "nameEn" TEXT;
ALTER TABLE "Stock" ADD COLUMN IF NOT EXISTS "shortName" TEXT;
ALTER TABLE "Stock" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'KRW';
ALTER TABLE "Stock" ADD COLUMN IF NOT EXISTS "region" TEXT NOT NULL DEFAULT 'Korea';
ALTER TABLE "Stock" ADD COLUMN IF NOT EXISTS "change" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Stock" ADD COLUMN IF NOT EXISTS "changePercent" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Stock" ADD COLUMN IF NOT EXISTS "isTracked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Stock" ADD COLUMN IF NOT EXISTS "lastPriceUpdate" TIMESTAMP(3);
ALTER TABLE "Stock" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add defaults to Stock columns that were missing defaults
ALTER TABLE "Stock" ALTER COLUMN "currentPrice" SET DEFAULT 0;
ALTER TABLE "Stock" ALTER COLUMN "previousClose" SET DEFAULT 0;

-- Add composite index on User
CREATE INDEX IF NOT EXISTS "User_classId_role_idx" ON "User"("classId", "role");
