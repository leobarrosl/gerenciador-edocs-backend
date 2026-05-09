/*
  Warnings:

  - You are about to drop the column `pdfOptions` on the `documents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "documents" DROP COLUMN "pdfOptions";

-- AlterTable
ALTER TABLE "templates" ADD COLUMN     "pdfOptions" JSONB;
