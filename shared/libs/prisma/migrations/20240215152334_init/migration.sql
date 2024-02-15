-- DropForeignKey
ALTER TABLE "invoice_detail" DROP CONSTRAINT "invoice_detail_invoice_id_fkey";

-- AddForeignKey
ALTER TABLE "invoice_detail" ADD CONSTRAINT "invoice_detail_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "investment_invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
