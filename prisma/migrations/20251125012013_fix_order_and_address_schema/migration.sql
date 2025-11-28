-- AlterTable
ALTER TABLE "Order" DROP COLUMN IF EXISTS "shopId",
ADD COLUMN IF NOT EXISTS "addressType" TEXT,
ADD COLUMN IF NOT EXISTS "apartmentNo" TEXT,
ADD COLUMN IF NOT EXISTS "country" TEXT,
ADD COLUMN IF NOT EXISTS "customerAltPhone" TEXT,
ADD COLUMN IF NOT EXISTS "landmark" TEXT,
ADD COLUMN IF NOT EXISTS "locality" TEXT,
ADD COLUMN IF NOT EXISTS "pincode" TEXT,
ADD COLUMN IF NOT EXISTS "selectedAMC" TEXT,
ADD COLUMN IF NOT EXISTS "selectedAdditionalWarranty" TEXT,
ADD COLUMN IF NOT EXISTS "state" TEXT;

-- CreateTable (if not exists)
CREATE TABLE IF NOT EXISTS "AMC" (
    "id" SERIAL NOT NULL,
    "amcCode" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "orderId" INTEGER NOT NULL,
    "userId" INTEGER,
    "agentId" INTEGER,
    "shopId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AMC_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'AMC_amcCode_key') THEN
        CREATE UNIQUE INDEX "AMC_amcCode_key" ON "AMC"("amcCode");
    END IF;
END $$;

-- AddForeignKey (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'AMC_productId_fkey'
    ) THEN
        ALTER TABLE "AMC" ADD CONSTRAINT "AMC_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'AMC_orderId_fkey'
    ) THEN
        ALTER TABLE "AMC" ADD CONSTRAINT "AMC_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'AMC_userId_fkey'
    ) THEN
        ALTER TABLE "AMC" ADD CONSTRAINT "AMC_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'AMC_agentId_fkey'
    ) THEN
        ALTER TABLE "AMC" ADD CONSTRAINT "AMC_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'AMC_shopId_fkey'
    ) THEN
        ALTER TABLE "AMC" ADD CONSTRAINT "AMC_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
