/*
  Warnings:

  - You are about to drop the column `potentialValue` on the `Attendance` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "potentialValue",
ADD COLUMN     "potentialValueCents" INTEGER;
