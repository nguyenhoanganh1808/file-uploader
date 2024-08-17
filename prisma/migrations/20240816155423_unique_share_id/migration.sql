/*
  Warnings:

  - A unique constraint covering the columns `[shareId]` on the table `Folder` will be added. If there are existing duplicate values, this will fail.
  - Made the column `shareId` on table `Folder` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Folder" ALTER COLUMN "shareId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Folder_shareId_key" ON "Folder"("shareId");
