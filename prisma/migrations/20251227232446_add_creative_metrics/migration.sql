-- CreateTable
CREATE TABLE "AdCreativeDailyMetrics" (
    "id" TEXT NOT NULL,
    "creativeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "spend" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdCreativeDailyMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdCreativeDailyMetrics_creativeId_idx" ON "AdCreativeDailyMetrics"("creativeId");

-- CreateIndex
CREATE UNIQUE INDEX "AdCreativeDailyMetrics_creativeId_date_key" ON "AdCreativeDailyMetrics"("creativeId", "date");

-- AddForeignKey
ALTER TABLE "AdCreativeDailyMetrics" ADD CONSTRAINT "AdCreativeDailyMetrics_creativeId_fkey" FOREIGN KEY ("creativeId") REFERENCES "AdCreative"("id") ON DELETE CASCADE ON UPDATE CASCADE;
