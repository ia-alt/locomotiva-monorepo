-- CreateTable
CREATE TABLE "printers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "supportedMaterials" TEXT[],
    "enabled" BOOLEAN NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "printers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "print_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "printerId" TEXT,
    "purpose" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSizeBytes" INTEGER,
    "material" TEXT NOT NULL,
    "estimatedDurationMinutes" INTEGER,
    "preferredDate" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "scheduledStartTime" TIMESTAMP(3),
    "scheduledEndTime" TIMESTAMP(3),
    "rejectionCancelReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "print_requests_pkey" PRIMARY KEY ("id")
);
