-- AlterTable
ALTER TABLE "medical_record_services" ADD COLUMN     "doctor_id" INTEGER;

-- AddForeignKey
ALTER TABLE "medical_record_services" ADD CONSTRAINT "medical_record_services_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "staffs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
