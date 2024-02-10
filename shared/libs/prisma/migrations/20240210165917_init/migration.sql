-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "service_id" INTEGER;

-- AlterTable
ALTER TABLE "medical_supplies" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "clinic_services"("id") ON DELETE SET NULL ON UPDATE CASCADE;
