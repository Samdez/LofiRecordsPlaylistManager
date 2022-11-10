import { Inject, Injectable } from '@nestjs/common';
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

  @Cron(CronExpression.EVERY_5_MINUTES)
  async startProcess(numOfRetrys = 0) {
    this.spotifyApiService.initClient();
    const promotionOnePlaylistId = this.config.get('PROMOTION_ONE_PLAYLIST_ID');
    const promotionTwoPlaylistId = this.config.get('PROMOTION_TWO_PLAYLIST_ID');
    const compilationPlaylistId = this.config.get('COMPILATION_PLAYLIST_ID');
    const favoritesPlaylistId = this.config.get('FAVORITES_PLAYLIST_ID');
    const releasesPlaylistId = this.config.get('RELEASES_PLAYLIST_ID');

    let promotionOneTracks: SpotifyApi.PlaylistTrackObject[],
      promotionTwoTracks: SpotifyApi.PlaylistTrackObject[],
      compilationTracks: SpotifyApi.PlaylistTrackObject[],
      favoritesTracks: SpotifyApi.PlaylistTrackObject[],
      releasesTracks: SpotifyApi.PlaylistTrackObject[];
    try {
      promotionOneTracks = await this.playlistService.getPlaylistTracks(
        promotionOnePlaylistId,
      );
      promotionTwoTracks = await this.playlistService.getPlaylistTracks(
        promotionTwoPlaylistId,
      );
      compilationTracks = await this.playlistService.getPlaylistTracks(
        compilationPlaylistId,
      );
      favoritesTracks = await this.playlistService.getPlaylistTracks(
        favoritesPlaylistId,
      );
      releasesTracks = await this.playlistService.getPlaylistTracks(
        releasesPlaylistId,
      );
    } catch (error) {
      throw new Error(error.message);
    }

    try {
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
      );
    } catch (error) {
      numOfRetrys++;
      console.log(error.message);
      if (numOfRetrys <= 10) {
        this.startProcess(numOfRetrys);
      }
    }
  }
}
