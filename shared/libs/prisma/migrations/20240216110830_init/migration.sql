-- AlterTable
ALTER TABLE "investment_invoice" ADD COLUMN     "cashier_id" INTEGER;

-- AddForeignKey
ALTER TABLE "investment_invoice" ADD CONSTRAINT "investment_invoice_cashier_id_fkey" FOREIGN KEY ("cashier_id") REFERENCES "staffs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
