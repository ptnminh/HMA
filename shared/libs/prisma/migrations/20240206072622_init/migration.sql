/*
  Warnings:

  - You are about to drop the column `disabled_at` on the `clinic_services` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "clinic_services" DROP COLUMN "disabled_at",
ADD COLUMN     "deleted_at" TIMESTAMP(3);
