-- CreateTable
CREATE TABLE "Complaint" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "serviceType" TEXT NOT NULL,
    "preferredDate" TIMESTAMP(3),
    "preferredTime" TEXT,
    "address" TEXT NOT NULL,
    "productType" TEXT,
    "additionalInfo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Complaint_userId_idx" ON "Complaint"("userId");

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
