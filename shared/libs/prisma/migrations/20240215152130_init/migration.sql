-- CreateTable
CREATE TABLE "investment_invoice" (
    "id" SERIAL NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "medical_record_id" INTEGER NOT NULL,
    "invoice_date" TEXT,
    "description" TEXT,
    "status" INTEGER NOT NULL DEFAULT 0,
    "total_payment" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "investment_invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_detail" (
    "id" SERIAL NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_detail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "investment_invoice_medical_record_id_key" ON "investment_invoice"("medical_record_id");

-- AddForeignKey
ALTER TABLE "investment_invoice" ADD CONSTRAINT "investment_invoice_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_invoice" ADD CONSTRAINT "investment_invoice_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_invoice" ADD CONSTRAINT "investment_invoice_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "medical_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_detail" ADD CONSTRAINT "invoice_detail_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
