-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "googleAccessToken" TEXT,
    "googleRefreshToken" TEXT,
    "tokenExpiresAt" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userToneProfile" JSONB,
    "emailCheckFrequency" INTEGER NOT NULL DEFAULT 18,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversionLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "userInput" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "aiOutput" TEXT NOT NULL,
    "detectedTone" TEXT NOT NULL,
    "previewShown" BOOLEAN NOT NULL,
    "userEdited" BOOLEAN NOT NULL,
    "editsApplied" TEXT,
    "sentSuccessfully" BOOLEAN NOT NULL,
    "replyTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMetrics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "repliesAttempted" INTEGER NOT NULL DEFAULT 0,
    "repliesCompleted" INTEGER NOT NULL DEFAULT 0,
    "avgReplyTimeSeconds" DOUBLE PRECISION,
    "draftAbandonmentCount" INTEGER NOT NULL DEFAULT 0,
    "stressLevel" INTEGER,
    "cognitiveLoadTLX" INTEGER,
    "mobileReplies" INTEGER NOT NULL DEFAULT 0,
    "emailCheckCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserMetrics_userId_date_key" ON "UserMetrics"("userId", "date");

-- AddForeignKey
ALTER TABLE "ConversionLog" ADD CONSTRAINT "ConversionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMetrics" ADD CONSTRAINT "UserMetrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
