/*
  Warnings:

  - You are about to drop the column `amcContractId` on the `AMC` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `AMC` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `AMC` table. All the data in the column will be lost.
  - You are about to drop the column `additionalInfo` on the `Complaint` table. All the data in the column will be lost.
  - You are about to drop the column `productType` on the `Complaint` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `ServiceEvent` table. All the data in the column will be lost.
  - You are about to drop the column `parts` on the `ServiceEvent` table. All the data in the column will be lost.
  - You are about to drop the column `pricePaid` on the `ServiceEvent` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `ServiceEvent` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ticketId]` on the table `ServiceEvent` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `amcId` to the `AMCContract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderId` to the `AMCContract` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ServiceEventStatus" AS ENUM ('PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RemarkType" AS ENUM ('RESOLVED', 'RESCHEDULED', 'FOLLOW_UP', 'GENERAL');

-- DropForeignKey
ALTER TABLE "AMC" DROP CONSTRAINT "AMC_amcContractId_fkey";

-- DropForeignKey
ALTER TABLE "AMC" DROP CONSTRAINT "AMC_orderId_fkey";

-- DropForeignKey
ALTER TABLE "AMC" DROP CONSTRAINT "AMC_productId_fkey";

-- DropIndex
DROP INDEX "AMC_amcContractId_idx";

-- AlterTable
ALTER TABLE "AMC" DROP COLUMN "amcContractId",
DROP COLUMN "orderId",
DROP COLUMN "productId";

-- AlterTable
ALTER TABLE "AMCContract" ADD COLUMN     "amcId" INTEGER NOT NULL,
ADD COLUMN     "orderId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Complaint" DROP COLUMN "additionalInfo",
DROP COLUMN "productType",
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "ServiceEvent" DROP COLUMN "endDate",
DROP COLUMN "parts",
DROP COLUMN "pricePaid",
DROP COLUMN "startDate",
ADD COLUMN     "actionDate" TIMESTAMP(3),
ADD COLUMN     "amcEventType" TEXT,
ADD COLUMN     "complaintId" INTEGER,
ADD COLUMN     "relatedEventId" INTEGER,
ADD COLUMN     "repairEventType" TEXT,
ADD COLUMN     "scheduledDates" TIMESTAMP(3)[],
ADD COLUMN     "scheduledRemarks" TEXT,
ADD COLUMN     "shopId" INTEGER,
ADD COLUMN     "status" "ServiceEventStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "ticketId" INTEGER;

-- CreateTable
CREATE TABLE "Remark" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "type" "RemarkType" NOT NULL DEFAULT 'GENERAL',
    "shopId" INTEGER,
    "agentId" INTEGER,
    "serviceEventId" INTEGER,
    "ticketId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Remark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AMCToProduct" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AMCToProduct_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Remark_shopId_idx" ON "Remark"("shopId");

-- CreateIndex
CREATE INDEX "Remark_agentId_idx" ON "Remark"("agentId");

-- CreateIndex
CREATE INDEX "Remark_serviceEventId_idx" ON "Remark"("serviceEventId");

-- CreateIndex
CREATE INDEX "Remark_ticketId_idx" ON "Remark"("ticketId");

-- CreateIndex
CREATE INDEX "_AMCToProduct_B_index" ON "_AMCToProduct"("B");

-- CreateIndex
CREATE INDEX "AMCContract_amcId_idx" ON "AMCContract"("amcId");

-- CreateIndex
CREATE INDEX "AMCContract_orderId_idx" ON "AMCContract"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceEvent_ticketId_key" ON "ServiceEvent"("ticketId");

-- CreateIndex
CREATE INDEX "ServiceEvent_shopId_idx" ON "ServiceEvent"("shopId");

-- CreateIndex
CREATE INDEX "ServiceEvent_status_idx" ON "ServiceEvent"("status");

-- AddForeignKey
ALTER TABLE "AMCContract" ADD CONSTRAINT "AMCContract_amcId_fkey" FOREIGN KEY ("amcId") REFERENCES "AMC"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AMCContract" ADD CONSTRAINT "AMCContract_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceEvent" ADD CONSTRAINT "ServiceEvent_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceEvent" ADD CONSTRAINT "ServiceEvent_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceEvent" ADD CONSTRAINT "ServiceEvent_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceEvent" ADD CONSTRAINT "ServiceEvent_relatedEventId_fkey" FOREIGN KEY ("relatedEventId") REFERENCES "ServiceEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Remark" ADD CONSTRAINT "Remark_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Remark" ADD CONSTRAINT "Remark_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Remark" ADD CONSTRAINT "Remark_serviceEventId_fkey" FOREIGN KEY ("serviceEventId") REFERENCES "ServiceEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Remark" ADD CONSTRAINT "Remark_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AMCToProduct" ADD CONSTRAINT "_AMCToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "AMC"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AMCToProduct" ADD CONSTRAINT "_AMCToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
