-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'ACTIVE', 'CANCELLED', 'COMPLETED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "additionalWarranty" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "amcPurchased" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "freeInstallation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "freeWarranty" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "installationCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "installationDate" TIMESTAMP(3),
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "Warranty" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "orderId" INTEGER NOT NULL,
    "warrantyType" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "durationMonths" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "additionalWarranty" BOOLEAN NOT NULL DEFAULT false,
    "warrantyAmount" DOUBLE PRECISION,
    "termsAndConditions" TEXT,
    "claimedDate" TIMESTAMP(3),
    "claimDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Warranty_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Warranty" ADD CONSTRAINT "Warranty_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warranty" ADD CONSTRAINT "Warranty_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
