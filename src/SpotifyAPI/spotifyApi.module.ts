import { Module } from '@nestjs/common';
import { SpotifyAPIService } from './spotifyApi.service';

@Module({
  imports: [],
  controllers: [],
  providers: [SpotifyAPIService],
  exports: [SpotifyAPIService],
})
export class SpotifyAPIModule {}
