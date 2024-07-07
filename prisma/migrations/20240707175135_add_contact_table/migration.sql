-- CreateTable
CREATE TABLE "Contact" (
    "contact1" INTEGER NOT NULL,
    "contact2" INTEGER NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("contact1","contact2")
);

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_contact1_fkey" FOREIGN KEY ("contact1") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_contact2_fkey" FOREIGN KEY ("contact2") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;
