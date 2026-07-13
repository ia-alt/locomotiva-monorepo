-- CreateTable
CREATE TABLE "printing_settings" (
    "id" TEXT NOT NULL,
    "weekdays" INTEGER[],
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,

    CONSTRAINT "printing_settings_pkey" PRIMARY KEY ("id")
);
