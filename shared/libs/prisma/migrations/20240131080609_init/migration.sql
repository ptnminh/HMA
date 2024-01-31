/*
  Warnings:

  - You are about to drop the column `name` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `category` table. All the data in the column will be lost.
  - Added the required column `category_name` to the `category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category_type` to the `category` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "category" DROP COLUMN "name",
DROP COLUMN "type",
ADD COLUMN     "category_name" TEXT NOT NULL,
ADD COLUMN     "category_type" INTEGER NOT NULL;
