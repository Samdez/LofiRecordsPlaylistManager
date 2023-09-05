import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { TrackModule } from 'src/Track/track.module';
import { ArtistModule } from 'src/Artist/artist.module';

@Module({
  imports: [TrackModule, ArtistModule],
  controllers: [],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
