-- CreateTable
CREATE TABLE "RecoveryCodesByEmail" (
    "userID" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "finishedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "RecoveryCodesByEmail_userID_key" ON "RecoveryCodesByEmail"("userID");

-- AddForeignKey
ALTER TABLE "RecoveryCodesByEmail" ADD CONSTRAINT "RecoveryCodesByEmail_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;
