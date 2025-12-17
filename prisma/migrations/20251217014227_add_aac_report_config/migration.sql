-- CreateTable
CREATE TABLE "AacReportConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ra" TEXT,
    "polo" TEXT,
    "ingressDate" TEXT,
    "intro" TEXT,
    "conclusion" TEXT,
    "activityDetails" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AacReportConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AacReportConfig_userId_key" ON "AacReportConfig"("userId");

-- AddForeignKey
ALTER TABLE "AacReportConfig" ADD CONSTRAINT "AacReportConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
