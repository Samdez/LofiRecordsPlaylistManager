import { Module } from '@nestjs/common';
import { AuthModule } from 'src/Auth/auth.module';
import { GoogleSheetsModule } from 'src/GoogleSheets/googleSheets.module';
import { SpotifyAPIModule } from 'src/SpotifyAPI/spotifyApi.module';
import { StatsModule } from 'src/Stats/stats.module';
import { PlaylistService } from './playlist.service';

@Module({
  imports: [AuthModule, SpotifyAPIModule, GoogleSheetsModule, StatsModule],
  controllers: [],
  providers: [PlaylistService],
  exports: [PlaylistService],
})
export class PlaylistModule {}
