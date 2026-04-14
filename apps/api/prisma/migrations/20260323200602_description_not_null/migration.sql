/*
  Warnings:

  - Made the column `description` on table `bookings` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "bookings" ALTER COLUMN "description" SET NOT NULL;
