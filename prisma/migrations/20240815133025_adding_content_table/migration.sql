/*
  Warnings:

  - You are about to drop the column `file` on the `Content` table. All the data in the column will be lost.
  - Added the required column `createdAt` to the `Content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filepath` to the `Content` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Content" DROP COLUMN "file",
ADD COLUMN     "createdAt" TIMESTAMPTZ NOT NULL,
ADD COLUMN     "filepath" TEXT NOT NULL;
