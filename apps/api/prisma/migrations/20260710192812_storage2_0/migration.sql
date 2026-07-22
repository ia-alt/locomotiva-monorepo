/*
  Warnings:

  - Made the column `sizeBytes` on table `files` required. This step will fail if there are existing NULL values in that column.
  - Made the column `uploadedByUserId` on table `files` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "files" ALTER COLUMN "sizeBytes" SET NOT NULL,
ALTER COLUMN "uploadedByUserId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
