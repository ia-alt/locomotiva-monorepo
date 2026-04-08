/*
  Warnings:

  - You are about to drop the column `checkinTotemName` on the `access_logs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "access_logs" DROP COLUMN "checkinTotemName",
ADD COLUMN     "checkinTotemId" TEXT;
