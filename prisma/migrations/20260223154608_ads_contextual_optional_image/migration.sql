-- AlterTable
ALTER TABLE "AdCampaign" ADD COLUMN     "targetSubjectId" TEXT;

-- AlterTable
ALTER TABLE "AdCreative" ALTER COLUMN "imageUrl" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "AdCampaign" ADD CONSTRAINT "AdCampaign_targetSubjectId_fkey" FOREIGN KEY ("targetSubjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
