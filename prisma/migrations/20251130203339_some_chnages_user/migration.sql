-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "discount" DECIMAL(65,30) DEFAULT 0;

-- AlterTable
ALTER TABLE "Warranty" ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "Warranty" ADD CONSTRAINT "Warranty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
