import { PrismaService } from 'src/Prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PlaylistStatsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createPlaylist(playlist: Prisma.PlaylistCreateInput) {
    return this.prismaService.playlist.create({ data: playlist });
  }

  async getPlaylists() {
    return this.prismaService.playlist.findMany();
  }

  async deletePlaylist(id: string) {
    return this.prismaService.playlist.delete({ where: { id } });
  }

  async upsertPlaylist(playlist: SpotifyApi.SinglePlaylistResponse) {
    const { followers, name, id } = playlist;
    return this.prismaService.playlist.upsert({
      where: { spotifyId: id },
      update: {
        followers: followers.total,
        name: name,
      },
      create: {
        followers: followers.total,
        name: name,
        spotifyId: id,
      },
    });
  }
}
