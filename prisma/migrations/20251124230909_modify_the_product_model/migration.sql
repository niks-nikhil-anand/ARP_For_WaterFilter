/*
  Warnings:

  - You are about to drop the column `name` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `shopId` on the `Product` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_shopId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "name",
DROP COLUMN "shopId",
ADD COLUMN     "createdById" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
