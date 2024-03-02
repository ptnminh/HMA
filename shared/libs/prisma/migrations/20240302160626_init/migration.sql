-- DropForeignKey
ALTER TABLE "clinic_request_services" DROP CONSTRAINT "clinic_request_services_service_id_fkey";

-- AlterTable
ALTER TABLE "clinic_request_services" ALTER COLUMN "service_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "clinic_request_services" ADD CONSTRAINT "clinic_request_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "clinic_services"("id") ON DELETE SET NULL ON UPDATE CASCADE;
