-- AlterTable
ALTER TABLE "Chat" ALTER COLUMN "chatPhoto" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "displayPhotoID" SET DATA TYPE TEXT;
