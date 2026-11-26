-- CreateEnum
CREATE TYPE "AddressLabel" AS ENUM ('HOME', 'WORK', 'OTHER');

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "customLabel" TEXT,
ADD COLUMN     "label" "AddressLabel" NOT NULL DEFAULT 'OTHER';
