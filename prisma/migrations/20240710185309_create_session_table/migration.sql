-- CreateTable
CREATE TABLE "Session" (
    "sessionID" SERIAL NOT NULL,
    "userID" INTEGER NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "ua" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("sessionID")
);

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;
