/*
  Warnings:

  - You are about to drop the column `customerAddress` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `customerEmail` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `customerName` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `customerPhone` on the `Ticket` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "customerAddress",
DROP COLUMN "customerEmail",
DROP COLUMN "customerName",
DROP COLUMN "customerPhone",
ADD COLUMN     "paymentMethod" "PaymentMethod",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
