-- CreateTable
CREATE TABLE "prescription_detail" (
    "id" SERIAL NOT NULL,
    "medicine_name" TEXT NOT NULL,
    "dosage" INTEGER,
    "unit" TEXT,
    "duration" TEXT,
    "using_time" TEXT,
    "dose_interval" TEXT,
    "note" TEXT,
    "medical_record_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prescription_detail_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "prescription_detail" ADD CONSTRAINT "prescription_detail_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "medical_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
