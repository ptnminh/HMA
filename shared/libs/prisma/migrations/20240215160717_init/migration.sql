-- AddForeignKey
ALTER TABLE "medical_record_services" ADD CONSTRAINT "medical_record_services_clinic_service_id_fkey" FOREIGN KEY ("clinic_service_id") REFERENCES "clinic_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
