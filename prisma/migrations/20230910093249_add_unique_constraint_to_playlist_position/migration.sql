/*
  Warnings:

  - The primary key for the `PlaylistTrackPosition` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `PlaylistTrackPosition` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[trackId,playlistId,date]` on the table `PlaylistTrackPosition` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PlaylistTrackPosition" DROP CONSTRAINT "PlaylistTrackPosition_pkey",
DROP COLUMN "id",
ALTER COLUMN "trackId" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistTrackPosition_trackId_playlistId_date_key" ON "PlaylistTrackPosition"("trackId", "playlistId", "date");
