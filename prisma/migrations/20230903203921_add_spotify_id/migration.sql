/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Artist` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `spotifyId` to the `Artist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `spotifyId` to the `Track` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Artist" ADD COLUMN     "spotifyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "spotifyId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Artist_name_key" ON "Artist"("name");

-- CreateIndex
CREATE INDEX "Artist_spotifyId_idx" ON "Artist"("spotifyId");
