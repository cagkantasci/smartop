-- AlterTable
ALTER TABLE "users" ADD COLUMN     "biometric_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location_address" TEXT,
ADD COLUMN     "location_lat" DECIMAL(10,8),
ADD COLUMN     "location_lng" DECIMAL(11,8),
ADD COLUMN     "location_updated_at" TIMESTAMP(3),
ADD COLUMN     "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false;
