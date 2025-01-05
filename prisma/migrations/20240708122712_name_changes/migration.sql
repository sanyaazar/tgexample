/*
  Warnings:

  - The primary key for the `Contact` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `contact1` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `contact2` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `finishedAt` on the `RecoveryCodesByEmail` table. All the data in the column will be lost.
  - Added the required column `contactID` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerID` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `RecoveryCodesByEmail` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_contact1_fkey";

-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_contact2_fkey";

-- AlterTable
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_pkey",
DROP COLUMN "contact1",
DROP COLUMN "contact2",
ADD COLUMN     "contactID" INTEGER NOT NULL,
ADD COLUMN     "ownerID" INTEGER NOT NULL,
ADD CONSTRAINT "Contact_pkey" PRIMARY KEY ("ownerID", "contactID");

-- AlterTable
ALTER TABLE "RecoveryCodesByEmail" DROP COLUMN "finishedAt",
ADD COLUMN     "expiresAt" TIMESTAMPTZ NOT NULL;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_ownerID_fkey" FOREIGN KEY ("ownerID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_contactID_fkey" FOREIGN KEY ("contactID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;
