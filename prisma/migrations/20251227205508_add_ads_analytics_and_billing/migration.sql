/*
  Warnings:

  - You are about to drop the column `costPerClick` on the `AdCampaign` table. All the data in the column will be lost.
  - Added the required column `costValue` to the `AdCampaign` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AdBillingType" AS ENUM ('CPC', 'CPM');

-- CreateEnum
CREATE TYPE "AdEventType" AS ENUM ('VIEW', 'CLICK');

-- AlterTable
ALTER TABLE "AdCampaign" DROP COLUMN "costPerClick",
ADD COLUMN     "billingType" "AdBillingType" NOT NULL DEFAULT 'CPC',
ADD COLUMN     "costValue" INTEGER NOT NULL,
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "AdDailyMetrics" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "spend" INTEGER NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdDailyMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdEventLog" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "creativeId" TEXT,
    "type" "AdEventType" NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "geoRegion" TEXT,
    "cost" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdEventLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdDailyMetrics_campaignId_idx" ON "AdDailyMetrics"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "AdDailyMetrics_campaignId_date_key" ON "AdDailyMetrics"("campaignId", "date");

-- CreateIndex
CREATE INDEX "AdEventLog_campaignId_idx" ON "AdEventLog"("campaignId");

-- CreateIndex
CREATE INDEX "AdEventLog_createdAt_idx" ON "AdEventLog"("createdAt");

-- AddForeignKey
ALTER TABLE "AdDailyMetrics" ADD CONSTRAINT "AdDailyMetrics_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "AdCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdEventLog" ADD CONSTRAINT "AdEventLog_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "AdCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdEventLog" ADD CONSTRAINT "AdEventLog_creativeId_fkey" FOREIGN KEY ("creativeId") REFERENCES "AdCreative"("id") ON DELETE SET NULL ON UPDATE CASCADE;
