/*
  Warnings:

  - You are about to drop the column `chatType` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `chatID` on the `Message` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_chatID_fkey";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "chatType";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "chatID";

-- CreateTable
CREATE TABLE "ChatMessage" (
    "chatID" INTEGER NOT NULL,
    "senderID" INTEGER NOT NULL,
    "messageID" INTEGER NOT NULL,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("chatID","senderID","messageID")
);

-- CreateTable
CREATE TABLE "DialogMessage" (
    "senderID" INTEGER NOT NULL,
    "receiverID" INTEGER NOT NULL,
    "messageID" INTEGER NOT NULL,

    CONSTRAINT "DialogMessage_pkey" PRIMARY KEY ("senderID","receiverID","messageID")
);

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_chatID_fkey" FOREIGN KEY ("chatID") REFERENCES "Chat"("chatID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderID_fkey" FOREIGN KEY ("senderID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_messageID_fkey" FOREIGN KEY ("messageID") REFERENCES "Message"("messageID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DialogMessage" ADD CONSTRAINT "DialogMessage_senderID_fkey" FOREIGN KEY ("senderID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DialogMessage" ADD CONSTRAINT "DialogMessage_receiverID_fkey" FOREIGN KEY ("receiverID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DialogMessage" ADD CONSTRAINT "DialogMessage_messageID_fkey" FOREIGN KEY ("messageID") REFERENCES "Message"("messageID") ON DELETE RESTRICT ON UPDATE CASCADE;
