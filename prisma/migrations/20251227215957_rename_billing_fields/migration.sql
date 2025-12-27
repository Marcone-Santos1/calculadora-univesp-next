/*
  Warnings:

  - You are about to drop the column `cnpj` on the `AdvertiserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `whatsapp` on the `AdvertiserProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AdvertiserProfile" DROP COLUMN "cnpj",
DROP COLUMN "whatsapp",
ADD COLUMN     "cellphone" TEXT,
ADD COLUMN     "taxId" TEXT;
