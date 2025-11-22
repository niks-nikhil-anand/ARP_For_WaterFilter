/*
  Warnings:

  - You are about to drop the column `address` on the `Shop` table. All the data in the column will be lost.
  - You are about to drop the `ProductDetail` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[uniqueId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `uniqueId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProductDetail" DROP CONSTRAINT "ProductDetail_amcContractId_fkey";

-- DropForeignKey
ALTER TABLE "ProductDetail" DROP CONSTRAINT "ProductDetail_productId_fkey";

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "shopId" INTEGER;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "description" TEXT,
ADD COLUMN     "discount" DOUBLE PRECISION,
ADD COLUMN     "discountType" "DiscountType",
ADD COLUMN     "featuredImageUrl" TEXT,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "invoiceNo" TEXT,
ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "productName" TEXT,
ADD COLUMN     "uniqueId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Shop" DROP COLUMN "address",
ADD COLUMN     "alternateMobile" TEXT,
ADD COLUMN     "gstNumber" TEXT,
ADD COLUMN     "panNumber" TEXT,
ADD COLUMN     "shopName" TEXT;

-- DropTable
DROP TABLE "ProductDetail";

-- CreateIndex
CREATE UNIQUE INDEX "Product_uniqueId_key" ON "Product"("uniqueId");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE SET NULL ON UPDATE CASCADE;
