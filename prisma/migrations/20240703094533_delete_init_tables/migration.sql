/*
  Warnings:

  - You are about to drop the `Chat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChatUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Content` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Content" DROP CONSTRAINT "Content_messageID_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_chatID_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_userID_fkey";

-- DropTable
DROP TABLE "Chat";

-- DropTable
DROP TABLE "ChatUser";

-- DropTable
DROP TABLE "Content";

-- DropTable
DROP TABLE "Message";

-- DropTable
DROP TABLE "User";
