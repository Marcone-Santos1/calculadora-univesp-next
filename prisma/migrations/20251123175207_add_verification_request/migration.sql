-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "verificationRequestDate" TIMESTAMP(3),
ADD COLUMN     "verificationRequested" BOOLEAN NOT NULL DEFAULT false;
