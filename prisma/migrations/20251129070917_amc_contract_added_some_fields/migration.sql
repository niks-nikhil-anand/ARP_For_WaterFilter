/*
  Warnings:

  - You are about to drop the column `amountPaid` on the `AMC` table. All the data in the column will be lost.
  - You are about to drop the column `durationMonths` on the `AMC` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `AMC` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `AMC` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `AMC` table. All the data in the column will be lost.
  - You are about to drop the column `durationMonths` on the `AMCContract` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `AMCContract` table. All the data in the column will be lost.
  - Added the required column `endDate` to the `AMCContract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finalPrice` to the `AMCContract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentDue` to the `AMCContract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentPaid` to the `AMCContract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `AMCContract` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "AMC_endDate_idx";

-- AlterTable
ALTER TABLE "AMC" DROP COLUMN "amountPaid",
DROP COLUMN "durationMonths",
DROP COLUMN "endDate",
DROP COLUMN "isActive",
DROP COLUMN "startDate";

-- AlterTable
ALTER TABLE "AMCContract" DROP COLUMN "durationMonths",
DROP COLUMN "name",
ADD COLUMN     "agentId" INTEGER,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "discount" DECIMAL(65,30),
ADD COLUMN     "discountType" "DiscountType",
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "finalPrice" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "nextPaymentDate" TIMESTAMP(3),
ADD COLUMN     "paymentDue" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "paymentMethod" "PaymentMethod",
ADD COLUMN     "paymentNotes" TEXT,
ADD COLUMN     "paymentPaid" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "transactionId" TEXT;

-- AddForeignKey
ALTER TABLE "AMCContract" ADD CONSTRAINT "AMCContract_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
