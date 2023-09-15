import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PlaylistStatsService } from './playlistStats.service';

@Controller('playlistStats')
export class PlaylistStatsController {
  constructor(private playlistStatsService: PlaylistStatsService) {}

  @Get()
  getPlaylists() {
    return this.playlistStatsService.getPlaylists();
  }

  @Post()
  createPlaylist(@Body() playlist: Prisma.PlaylistCreateInput) {
    return this.playlistStatsService.createPlaylist(playlist);
  }

  @Delete(':id')
  deletePlaylist(@Param('id') id: string) {
    return this.playlistStatsService.deletePlaylist(id);
  }
}
