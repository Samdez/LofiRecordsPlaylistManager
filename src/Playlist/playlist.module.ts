import { Module } from '@nestjs/common';
import { AuthModule } from 'src/Auth/auth.module';
import { SpotifyAPIModule } from 'src/SpotifyAPI/spotifyApi.module';
import { PlaylistService } from './playlist.service';

@Module({
  imports: [AuthModule, SpotifyAPIModule],
  controllers: [],
  providers: [PlaylistService],
  exports: [PlaylistService],
})
export class PlaylistModule {}
