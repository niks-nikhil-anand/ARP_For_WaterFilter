/*
  Warnings:

  - You are about to drop the `_AMCToProduct` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `productId` to the `AMC` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `AMCContract` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_AMCToProduct" DROP CONSTRAINT "_AMCToProduct_A_fkey";

-- DropForeignKey
ALTER TABLE "_AMCToProduct" DROP CONSTRAINT "_AMCToProduct_B_fkey";

-- AlterTable
ALTER TABLE "AMC" ADD COLUMN     "productId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "AMCContract" ADD COLUMN     "productId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_AMCToProduct";

-- AddForeignKey
ALTER TABLE "AMC" ADD CONSTRAINT "AMC_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AMCContract" ADD CONSTRAINT "AMCContract_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
