-- CreateTable
CREATE TABLE "using_medical_supplies" (
    "id" SERIAL NOT NULL,
    "medical_supply_id" INTEGER NOT NULL,
    "clinic_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "using_medical_supplies_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "using_medical_supplies" ADD CONSTRAINT "using_medical_supplies_medical_supply_id_fkey" FOREIGN KEY ("medical_supply_id") REFERENCES "medical_supplies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "using_medical_supplies" ADD CONSTRAINT "using_medical_supplies_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "medical_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
