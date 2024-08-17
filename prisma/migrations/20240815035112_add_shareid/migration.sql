/*
  Warnings:

  - You are about to drop the column `expiredDateShare` on the `File` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "File" DROP COLUMN "expiredDateShare";

-- AlterTable
ALTER TABLE "Folder" ADD COLUMN     "shareId" TEXT;
