-- CreateEnum
CREATE TYPE "AacCategory" AS ENUM ('COURSE', 'CULTURAL', 'EXPERIENCE', 'INTERNSHIP', 'OTHER');

-- CreateTable
CREATE TABLE "AacActivity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "AacCategory" NOT NULL,
    "institution" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "originalHours" INTEGER NOT NULL,
    "validHours" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AacActivity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AacActivity" ADD CONSTRAINT "AacActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
