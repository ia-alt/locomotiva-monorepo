-- AlterTable
ALTER TABLE "users" ADD COLUMN "passwordResetCode" TEXT;
ALTER TABLE "users" ADD COLUMN "passwordResetCodeExpiry" TIMESTAMP(3);
