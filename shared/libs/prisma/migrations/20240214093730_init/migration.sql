-- CreateTable
CREATE TABLE "medical_records" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "clinicId" TEXT NOT NULL,
    "date_created" TIMESTAMP(3) NOT NULL,
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "blood_pressure" DOUBLE PRECISION,
    "temperature" DOUBLE PRECISION,
    "diagnose" TEXT,
    "result" TEXT,
    "examination_status" INTEGER,
    "payment_status" INTEGER,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_record_services" (
    "id" SERIAL NOT NULL,
    "medical_record_id" INTEGER NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "clinic_service_id" INTEGER NOT NULL,
    "service_result" TEXT,
    "service_name" TEXT,
    "amount" DOUBLE PRECISION,
    "payment_status" INTEGER,
    "return_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medical_record_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinic_request_services" (
    "code" TEXT NOT NULL,
    "service_name" TEXT NOT NULL,
    "service_id" INTEGER NOT NULL,
    "medical_record_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinic_request_services_pkey" PRIMARY KEY ("code")
);

-- CreateIndex
CREATE UNIQUE INDEX "medical_record_services_return_code_key" ON "medical_record_services"("return_code");

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "staffs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_record_services" ADD CONSTRAINT "medical_record_services_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_record_services" ADD CONSTRAINT "medical_record_services_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "medical_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_record_services" ADD CONSTRAINT "medical_record_services_return_code_fkey" FOREIGN KEY ("return_code") REFERENCES "clinic_request_services"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_request_services" ADD CONSTRAINT "clinic_request_services_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "medical_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_request_services" ADD CONSTRAINT "clinic_request_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "clinic_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
