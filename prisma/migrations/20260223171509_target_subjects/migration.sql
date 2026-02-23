/*
  Warnings:

  - You are about to drop the column `targetSubjectId` on the `AdCampaign` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AdCampaign" DROP CONSTRAINT "AdCampaign_targetSubjectId_fkey";

-- AlterTable
ALTER TABLE "AdCampaign" DROP COLUMN "targetSubjectId";

-- CreateTable
CREATE TABLE "_AdCampaignToSubject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AdCampaignToSubject_AB_unique" ON "_AdCampaignToSubject"("A", "B");

-- CreateIndex
CREATE INDEX "_AdCampaignToSubject_B_index" ON "_AdCampaignToSubject"("B");

-- AddForeignKey
ALTER TABLE "_AdCampaignToSubject" ADD CONSTRAINT "_AdCampaignToSubject_A_fkey" FOREIGN KEY ("A") REFERENCES "AdCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdCampaignToSubject" ADD CONSTRAINT "_AdCampaignToSubject_B_fkey" FOREIGN KEY ("B") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
