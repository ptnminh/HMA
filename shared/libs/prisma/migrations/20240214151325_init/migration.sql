-- CreateTable
CREATE TABLE "clinic_statistic" (
    "id" SERIAL NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "number_of_patients" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "number_of_appointments" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinic_statistic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clinic_statistic_clinic_id_date_key" ON "clinic_statistic"("clinic_id", "date");

-- AddForeignKey
ALTER TABLE "clinic_statistic" ADD CONSTRAINT "clinic_statistic_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
