-- DropForeignKey
ALTER TABLE "Agent" DROP CONSTRAINT "Agent_shopId_fkey";

-- AlterTable
ALTER TABLE "Agent" ALTER COLUMN "shopId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE SET NULL ON UPDATE CASCADE;
