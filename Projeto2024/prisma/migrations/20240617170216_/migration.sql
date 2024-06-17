/*
  Warnings:

  - The primary key for the `Like` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `Like` table. All the data in the column will be lost.
  - Added the required column `username` to the `Like` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_userId_fkey";

-- DropIndex
DROP INDEX "Like_userId_idx";

-- AlterTable
ALTER TABLE "Like" DROP CONSTRAINT "Like_pkey",
DROP COLUMN "userId",
ADD COLUMN     "username" TEXT NOT NULL,
ADD CONSTRAINT "Like_pkey" PRIMARY KEY ("username", "postId");

-- CreateIndex
CREATE INDEX "Like_username_idx" ON "Like"("username");

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
