-- DropForeignKey
ALTER TABLE "medical_suppliers" DROP CONSTRAINT "medical_suppliers_clinic_id_fkey";

-- AlterTable
ALTER TABLE "medical_suppliers" ALTER COLUMN "clinic_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "medical_suppliers" ADD CONSTRAINT "medical_suppliers_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
