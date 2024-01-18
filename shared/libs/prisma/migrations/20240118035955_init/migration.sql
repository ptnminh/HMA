-- AlterTable
ALTER TABLE "staffs" ADD COLUMN     "address" TEXT NOT NULL DEFAULT '227 Đ. Nguyễn Văn Cừ, Phường 4, Quận 5, TP.Hồ Chí Minh',
ADD COLUMN     "experience" INTEGER,
ADD COLUMN     "gender" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "phone_number" TEXT NOT NULL DEFAULT '0123456789',
ADD COLUMN     "specialize" TEXT;

-- CreateTable
CREATE TABLE "clinic_services" (
    "id" SERIAL NOT NULL,
    "clinicId" TEXT NOT NULL,
    "service_name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_disabled" BOOLEAN NOT NULL DEFAULT false,
    "disabled_at" TIMESTAMP(3),

    CONSTRAINT "clinic_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_service" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_disabled" BOOLEAN NOT NULL DEFAULT false,
    "disabled_at" TIMESTAMP(3),
    "staff_id" INTEGER NOT NULL,
    "clinic_service_id" INTEGER NOT NULL,

    CONSTRAINT "staff_service_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "clinic_services" ADD CONSTRAINT "clinic_services_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_service" ADD CONSTRAINT "staff_service_clinic_service_id_fkey" FOREIGN KEY ("clinic_service_id") REFERENCES "clinic_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_service" ADD CONSTRAINT "staff_service_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staffs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
