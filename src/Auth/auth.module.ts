import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SpotifyAPIModule } from 'src/SpotifyAPI/spotifyApi.module';

@Module({
  imports: [SpotifyAPIModule],
  controllers: [],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
