-- CreateTable
CREATE TABLE "govbr_pending_identities" (
    "id" TEXT NOT NULL,
    "govbrSub" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "picture" TEXT,
    "redirectTo" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "govbr_pending_identities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "govbr_pending_identities_expiresAt_idx" ON "govbr_pending_identities"("expiresAt");
