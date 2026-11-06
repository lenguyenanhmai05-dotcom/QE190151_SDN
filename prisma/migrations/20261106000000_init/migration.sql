-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reading_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookTitle" TEXT NOT NULL,
    "minutesRead" INTEGER NOT NULL,
    "genre" TEXT NOT NULL,
    "note" TEXT DEFAULT '',
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "readOn" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reading_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "reading_logs_userId_idx" ON "reading_logs"("userId");

-- AddForeignKey
ALTER TABLE "reading_logs" ADD CONSTRAINT "reading_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

