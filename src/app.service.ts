import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PlaylistService } from './Playlist/playlist.service';
import { SpotifyAPIService } from './SpotifyAPI/spotifyApi.service';

@Injectable()
export class AppService {
  @Inject(ConfigService)
  public config: ConfigService;
  constructor(
    private readonly playlistService: PlaylistService,
    private spotifyApiService: SpotifyAPIService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async startProcess(numOfRetrys = 0) {
    console.log(`Start Process`);
    try {
      this.spotifyApiService.initClient();
      const promotionOnePlaylistId = this.config.get(
        'PROMOTION_ONE_PLAYLIST_ID',
      );
      const promotionTwoPlaylistId = this.config.get(
        'PROMOTION_TWO_PLAYLIST_ID',
      );
      const compilationPlaylistId = this.config.get('COMPILATION_PLAYLIST_ID');
      const favoritesPlaylistId = this.config.get('FAVORITES_PLAYLIST_ID');
      const releasesPlaylistId = this.config.get('RELEASES_PLAYLIST_ID');
      const temporaryPlaylistId = this.config.get('TEMPORARY_PLAYLIST_ID');

      const promotionOneTracks = await this.playlistService.getPlaylistTracks(
        promotionOnePlaylistId,
      );
      const promotionTwoTracks = await this.playlistService.getPlaylistTracks(
        promotionTwoPlaylistId,
      );
      const compilationTracks = await this.playlistService.getPlaylistTracks(
        compilationPlaylistId,
      );
      const favoritesTracks = await this.playlistService.getPlaylistTracks(
        favoritesPlaylistId,
      );
      const releasesTracks = await this.playlistService.getPlaylistTracks(
        releasesPlaylistId,
      );
      const temporaryTracks = await this.playlistService.getPlaylistTracks(
        temporaryPlaylistId,
      );

      await this.playlistService.organizePlaylist(
        promotionOneTracks,
        promotionTwoTracks,
        compilationTracks,
        favoritesTracks,
        releasesTracks.filter(
          (track) =>
            new Date(track.track.album.release_date).getTime() <
            new Date('2022-05-21').getTime(),
        ),
        temporaryTracks,
      );
    } catch (error) {
      numOfRetrys++;
      console.log(error.message);
      if (numOfRetrys <= 10) {
        this.startProcess(numOfRetrys);
      } else {
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
