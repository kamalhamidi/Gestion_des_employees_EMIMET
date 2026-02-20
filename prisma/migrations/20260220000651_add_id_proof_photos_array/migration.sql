/*
  Warnings:

  - You are about to drop the column `idProofPhoto` on the `employees` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "employees" DROP COLUMN "idProofPhoto",
ADD COLUMN     "idProofPhotos" TEXT[];
