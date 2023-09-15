import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';

@Injectable()
export class TrackService {
  constructor(private prisma: PrismaService) {}

  indexTracks() {
    return this.prisma.track.findMany();
  }

  getTrack(trackId: string) {
    return this.prisma.track.findUnique({
      where: { id: trackId },
      include: { artists: true },
    });
  }

  createTrack(track: SpotifyApi.PlaylistTrackObject) {
    const trackData = {
      name: track.track.name,
      spotifyId: track.track.id,
      artists: {
        connectOrCreate: track.track.artists.map((artist) => {
          return {
            where: { name: artist.name },
            create: { name: artist.name, spotifyId: artist.id },
          };
        }),
      },
    };

    return this.prisma.track.upsert({
      where: { spotifyId: track.track.id },
      create: trackData,
      update: trackData,
    });
  }

  createTrackPlaylistPosition(
    track: SpotifyApi.PlaylistTrackObject,
    date: Date,
    playlistId: string,
    position: number,
  ) {
    return this.prisma.playlistTrackPosition.create({
      data: {
        track: { connect: { spotifyId: track.track.id } },
        date,
        playlist: {
          connect: {
            spotifyId: playlistId,
          },
        },
        position: position,
      },
    });
  }
}
