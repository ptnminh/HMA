-- AddForeignKey
ALTER TABLE "medical_supplies" ADD CONSTRAINT "medical_supplies_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
