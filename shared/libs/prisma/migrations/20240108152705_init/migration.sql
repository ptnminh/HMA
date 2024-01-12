/*
  Warnings:

  - The `disabled_at` column on the `staffs` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "staffs" DROP COLUMN "disabled_at",
ADD COLUMN     "disabled_at" TIMESTAMP(3);
