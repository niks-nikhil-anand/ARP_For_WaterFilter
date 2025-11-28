/*
  Warnings:

  - You are about to drop the column `agentId` on the `AMC` table. All the data in the column will be lost.
  - You are about to drop the column `amcCode` on the `AMC` table. All the data in the column will be lost.
  - You are about to drop the column `shopId` on the `AMC` table. All the data in the column will be lost.
  - You are about to drop the `AMCService` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[amcUniqueId]` on the table `AMC` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[invoiceNumber]` on the table `AMCContract` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `amcContractId` to the `AMC` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amcUniqueId` to the `AMC` table without a default value. This is not possible if the table is not empty.
  - Added the required column `durationMonths` to the `AMC` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `AMC` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `AMC` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoiceNumber` to the `AMCContract` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AMC" DROP CONSTRAINT "AMC_agentId_fkey";

-- DropForeignKey
ALTER TABLE "AMC" DROP CONSTRAINT "AMC_shopId_fkey";

-- DropForeignKey
ALTER TABLE "AMCService" DROP CONSTRAINT "AMCService_amcContractId_fkey";

-- DropIndex
DROP INDEX "AMC_amcCode_key";

-- AlterTable
ALTER TABLE "AMC" DROP COLUMN "agentId",
DROP COLUMN "amcCode",
DROP COLUMN "shopId",
ADD COLUMN     "amcContractId" INTEGER NOT NULL,
ADD COLUMN     "amcUniqueId" TEXT NOT NULL,
ADD COLUMN     "amountPaid" DOUBLE PRECISION,
ADD COLUMN     "durationMonths" INTEGER NOT NULL,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" "AMCStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "AMCContract" ADD COLUMN     "invoiceNumber" TEXT NOT NULL;

-- DropTable
DROP TABLE "AMCService";

-- CreateIndex
CREATE UNIQUE INDEX "AMC_amcUniqueId_key" ON "AMC"("amcUniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "AMCContract_invoiceNumber_key" ON "AMCContract"("invoiceNumber");

-- AddForeignKey
ALTER TABLE "AMC" ADD CONSTRAINT "AMC_amcContractId_fkey" FOREIGN KEY ("amcContractId") REFERENCES "AMCContract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
