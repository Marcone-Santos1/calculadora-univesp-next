-- CreateTable
CREATE TABLE "ScrapeHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "examName" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScrapeHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScrapeHistory_userId_idx" ON "ScrapeHistory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ScrapeHistory_userId_examId_key" ON "ScrapeHistory"("userId", "examId");

-- AddForeignKey
ALTER TABLE "ScrapeHistory" ADD CONSTRAINT "ScrapeHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
