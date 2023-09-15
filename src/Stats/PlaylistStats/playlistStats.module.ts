import { Module } from '@nestjs/common';
import { PlaylistStatsService } from './playlistStats.service';
import { PlaylistStatsController } from './playlistStats.controller';
import { PrismaModule } from 'src/Prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PlaylistStatsController],
  providers: [PlaylistStatsService],
  exports: [PlaylistStatsService],
})
export class PlaylistStatsModule {}
