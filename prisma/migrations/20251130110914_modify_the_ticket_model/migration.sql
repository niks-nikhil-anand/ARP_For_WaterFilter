-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "amountCollected" DECIMAL(65,30),
ADD COLUMN     "partsReplaced" TEXT,
ADD COLUMN     "timeSpent" DECIMAL(65,30),
ADD COLUMN     "workDescription" TEXT;
