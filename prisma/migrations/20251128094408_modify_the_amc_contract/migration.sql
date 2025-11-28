/*
  Warnings:

  - Added the required column `noOfServices` to the `AMCContract` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AMC" ADD COLUMN     "shopId" INTEGER;

-- AlterTable
ALTER TABLE "AMCContract" ADD COLUMN     "noOfServices" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "adhaarNumber" TEXT,
ADD COLUMN     "panNumber" TEXT,
ADD COLUMN     "profileImageUrl" TEXT;

-- AddForeignKey
ALTER TABLE "AMC" ADD CONSTRAINT "AMC_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE SET NULL ON UPDATE CASCADE;
