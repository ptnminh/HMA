/*
  Warnings:

  - You are about to drop the `medicine` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "medicine";

-- CreateTable
CREATE TABLE "medical_supplies" (
    "id" SERIAL NOT NULL,
    "medicine_name" TEXT NOT NULL,
    "stock" INTEGER,
    "price" DOUBLE PRECISION,
    "expiredAt" TIMESTAMP(3),
    "expiry" TIMESTAMP(3),
    "vendor" TEXT,
    "description" TEXT,
    "unit" TEXT,
    "note" TEXT,
    "category_id" INTEGER,
    "is_disabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "medical_supplies_pkey" PRIMARY KEY ("id")
);
