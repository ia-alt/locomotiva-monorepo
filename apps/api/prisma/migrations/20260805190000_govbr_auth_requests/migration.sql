-- CreateTable
CREATE TABLE "govbr_auth_requests" (
    "state" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "codeVerifier" TEXT NOT NULL,
    "redirectTo" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "govbr_auth_requests_pkey" PRIMARY KEY ("state")
);

-- CreateIndex
CREATE INDEX "govbr_auth_requests_expiresAt_idx" ON "govbr_auth_requests"("expiresAt");
