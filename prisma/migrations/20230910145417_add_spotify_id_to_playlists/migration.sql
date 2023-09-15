/*
  Warnings:

  - A unique constraint covering the columns `[spotifyId]` on the table `Playlist` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `spotifyId` to the `Playlist` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `Playlist` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Playlist" ADD COLUMN     "spotifyId" TEXT NOT NULL,
ALTER COLUMN "name" SET NOT NULL;

-- AlterTable
ALTER TABLE "PlaylistTrackPosition" ALTER COLUMN "playlistId" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Playlist_spotifyId_key" ON "Playlist"("spotifyId");

-- AddForeignKey
ALTER TABLE "PlaylistTrackPosition" ADD CONSTRAINT "PlaylistTrackPosition_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistTrackPosition" ADD CONSTRAINT "PlaylistTrackPosition_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
