/*
  Warnings:

  - A unique constraint covering the columns `[stlFileId]` on the table `print_requests` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[gcodeFileId]` on the table `print_requests` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "print_requests_stlFileId_key" ON "print_requests"("stlFileId");

-- CreateIndex
CREATE UNIQUE INDEX "print_requests_gcodeFileId_key" ON "print_requests"("gcodeFileId");

-- AddForeignKey
ALTER TABLE "print_requests" ADD CONSTRAINT "print_requests_stlFileId_fkey" FOREIGN KEY ("stlFileId") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "print_requests" ADD CONSTRAINT "print_requests_gcodeFileId_fkey" FOREIGN KEY ("gcodeFileId") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
