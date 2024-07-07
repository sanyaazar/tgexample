-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "Chat" (
    "chatID" SERIAL NOT NULL,
    "chatType" TEXT NOT NULL,
    "chatPhoto" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("chatID")
);

-- CreateTable
CREATE TABLE "User" (
    "userID" SERIAL NOT NULL,
    "login" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "tel" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT,
    "displayPhotoID" INTEGER,
    "dateOfBirth" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("userID")
);

-- CreateTable
CREATE TABLE "Content" (
    "contentID" SERIAL NOT NULL,
    "file" TEXT NOT NULL,
    "messageID" INTEGER NOT NULL,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("contentID")
);

-- CreateTable
CREATE TABLE "Message" (
    "messageID" SERIAL NOT NULL,
    "messageText" TEXT NOT NULL,
    "userID" INTEGER NOT NULL,
    "chatID" INTEGER NOT NULL,
    "sendAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("messageID")
);

-- CreateTable
CREATE TABLE "ChatUser" (
    "chatID" INTEGER NOT NULL,
    "userID" INTEGER NOT NULL,
    "userRole" "Role" NOT NULL DEFAULT 'USER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatUser_pkey" PRIMARY KEY ("chatID","userID")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");

-- CreateIndex
CREATE UNIQUE INDEX "User_tel_key" ON "User"("tel");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_displayPhotoID_key" ON "User"("displayPhotoID");

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_messageID_fkey" FOREIGN KEY ("messageID") REFERENCES "Message"("messageID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatID_fkey" FOREIGN KEY ("chatID") REFERENCES "Chat"("chatID") ON DELETE RESTRICT ON UPDATE CASCADE;
