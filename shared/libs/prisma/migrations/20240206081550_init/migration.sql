/*
  Warnings:

  - You are about to drop the column `address` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `birthday` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `phone_number` on the `patients` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "medical_supplies" ADD COLUMN     "clinic_id" TEXT;

-- AlterTable
ALTER TABLE "patients" DROP COLUMN "address",
DROP COLUMN "birthday",
DROP COLUMN "gender",
DROP COLUMN "phone_number";

-- AddForeignKey
ALTER TABLE "medical_supplies" ADD CONSTRAINT "medical_supplies_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
