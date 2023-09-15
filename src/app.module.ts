import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './User/user.module';
import { getEnvPath } from './common/helper/env.helper';
import { AuthModule } from './Auth/auth.module';
import { PlaylistModule } from './Playlist/playlist.module';
import { SpotifyAPIModule } from './SpotifyAPI/spotifyApi.module';
import { StatsModule } from './Stats/stats.module';
import { ArtistModule } from './Stats/Artist/artist.module';
const envFilePath: string = getEnvPath(`${__dirname}/common/envs`);
@Module({
  imports: [
    AuthModule,
    UserModule,
    PlaylistModule,
    SpotifyAPIModule,
    StatsModule,
    ConfigModule.forRoot({ envFilePath, isGlobal: true }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
