-- AlterTable
ALTER TABLE "medical_suppliers" ADD COLUMN     "expiry" TEXT,
ADD COLUMN     "medicine_name" TEXT,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "unit" DOUBLE PRECISION,
ADD COLUMN     "vendor" TEXT,
ALTER COLUMN "name" DROP NOT NULL;
