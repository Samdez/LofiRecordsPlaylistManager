import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { TrackModule } from 'src/Stats/Track/track.module';
import { ArtistModule } from 'src/Stats/Artist/artist.module';
import { PlaylistStatsModule } from './PlaylistStats/playlistStats.module';

@Module({
  imports: [TrackModule, ArtistModule, PlaylistStatsModule],
  controllers: [],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
