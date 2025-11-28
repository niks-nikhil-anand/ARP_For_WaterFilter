/*
  Warnings:

  - You are about to alter the column `amountPaid` on the `AMC` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `price` on the `AMCContract` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `amountPaid` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `discount` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `price` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `pricePaid` on the `ServiceEvent` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `warrantyAmount` on the `Warranty` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - Made the column `userId` on table `AMC` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `durationMonths` to the `AMCContract` table without a default value. This is not possible if the table is not empty.
  - Made the column `pincode` on table `Address` required. This step will fail if there are existing NULL values in that column.
  - Made the column `locality` on table `Address` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `Address` required. This step will fail if there are existing NULL values in that column.
  - Made the column `customerPhone` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `price` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "AMC" DROP CONSTRAINT "AMC_orderId_fkey";

-- DropForeignKey
ALTER TABLE "AMC" DROP CONSTRAINT "AMC_userId_fkey";

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_shopId_fkey";

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_userId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_recipientId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_shopId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceEvent" DROP CONSTRAINT "ServiceEvent_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Warranty" DROP CONSTRAINT "Warranty_orderId_fkey";

-- AlterTable
ALTER TABLE "AMC" ADD COLUMN     "cancelReason" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ALTER COLUMN "userId" SET NOT NULL,
ALTER COLUMN "amountPaid" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "AMCContract" ADD COLUMN     "durationMonths" INTEGER NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Address" ALTER COLUMN "pincode" SET NOT NULL,
ALTER COLUMN "locality" SET NOT NULL,
ALTER COLUMN "phone" SET NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ALTER COLUMN "customerPhone" SET NOT NULL,
ALTER COLUMN "amountPaid" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "discount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "price" SET NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "ServiceEvent" ALTER COLUMN "pricePaid" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Warranty" ALTER COLUMN "warrantyAmount" SET DATA TYPE DECIMAL(65,30);

-- CreateIndex
CREATE INDEX "AMC_status_idx" ON "AMC"("status");

-- CreateIndex
CREATE INDEX "AMC_userId_idx" ON "AMC"("userId");

-- CreateIndex
CREATE INDEX "AMC_shopId_idx" ON "AMC"("shopId");

-- CreateIndex
CREATE INDEX "AMC_endDate_idx" ON "AMC"("endDate");

-- CreateIndex
CREATE INDEX "AMC_amcContractId_idx" ON "AMC"("amcContractId");

-- CreateIndex
CREATE INDEX "AMCContract_status_idx" ON "AMCContract"("status");

-- CreateIndex
CREATE INDEX "AMCContract_shopId_idx" ON "AMCContract"("shopId");

-- CreateIndex
CREATE INDEX "Address_userId_idx" ON "Address"("userId");

-- CreateIndex
CREATE INDEX "Address_shopId_idx" ON "Address"("shopId");

-- CreateIndex
CREATE INDEX "Agent_userId_idx" ON "Agent"("userId");

-- CreateIndex
CREATE INDEX "Agent_shopId_idx" ON "Agent"("shopId");

-- CreateIndex
CREATE INDEX "Notification_recipientId_isRead_idx" ON "Notification"("recipientId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_category_idx" ON "Notification"("category");

-- CreateIndex
CREATE INDEX "Notification_priority_idx" ON "Notification"("priority");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_customerPhone_idx" ON "Order"("customerPhone");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "Order_productId_status_idx" ON "Order"("productId", "status");

-- CreateIndex
CREATE INDEX "Order_paymentStatus_idx" ON "Order"("paymentStatus");

-- CreateIndex
CREATE INDEX "Product_status_idx" ON "Product"("status");

-- CreateIndex
CREATE INDEX "Product_company_idx" ON "Product"("company");

-- CreateIndex
CREATE INDEX "Product_type_idx" ON "Product"("type");

-- CreateIndex
CREATE INDEX "ServiceEvent_type_idx" ON "ServiceEvent"("type");

-- CreateIndex
CREATE INDEX "ServiceEvent_customerId_idx" ON "ServiceEvent"("customerId");

-- CreateIndex
CREATE INDEX "ServiceEvent_agentId_idx" ON "ServiceEvent"("agentId");

-- CreateIndex
CREATE INDEX "ServiceEvent_productId_idx" ON "ServiceEvent"("productId");

-- CreateIndex
CREATE INDEX "ServiceEvent_orderId_idx" ON "ServiceEvent"("orderId");

-- CreateIndex
CREATE INDEX "ServiceEvent_type_customerId_idx" ON "ServiceEvent"("type", "customerId");

-- CreateIndex
CREATE INDEX "Shop_userId_idx" ON "Shop"("userId");

-- CreateIndex
CREATE INDEX "Ticket_status_idx" ON "Ticket"("status");

-- CreateIndex
CREATE INDEX "Ticket_priority_idx" ON "Ticket"("priority");

-- CreateIndex
CREATE INDEX "Ticket_agentId_idx" ON "Ticket"("agentId");

-- CreateIndex
CREATE INDEX "Ticket_shopId_idx" ON "Ticket"("shopId");

-- CreateIndex
CREATE INDEX "Ticket_status_priority_idx" ON "Ticket"("status", "priority");

-- CreateIndex
CREATE INDEX "Warranty_isActive_idx" ON "Warranty"("isActive");

-- CreateIndex
CREATE INDEX "Warranty_endDate_idx" ON "Warranty"("endDate");

-- CreateIndex
CREATE INDEX "Warranty_orderId_idx" ON "Warranty"("orderId");

-- CreateIndex
CREATE INDEX "Warranty_productId_idx" ON "Warranty"("productId");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warranty" ADD CONSTRAINT "Warranty_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AMC" ADD CONSTRAINT "AMC_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AMC" ADD CONSTRAINT "AMC_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceEvent" ADD CONSTRAINT "ServiceEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
