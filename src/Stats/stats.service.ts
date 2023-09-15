import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ArtistTrackCount } from 'src/Playlist/playlist.service';
import { TrackService } from 'src/Stats/Track/track.service';
import { PlaylistStatsService } from './PlaylistStats/playlistStats.service';

@Injectable()
export class StatsService {
  @Inject(ConfigService)
  public config: ConfigService;
  constructor(
    private readonly trackService: TrackService,
    private readonly playlistStatsService: PlaylistStatsService,
  ) {}

  orderArtistsByNumberOfTracks(artistsTrackCount: ArtistTrackCount) {
    return Object.values(artistsTrackCount).sort((a, b) => b.points - a.points);
  }

  async updateStats(
    tracks: SpotifyApi.PlaylistTrackObject[],
    playlist: SpotifyApi.SinglePlaylistResponse,
  ) {
    const playlistId = this.config.get('MAIN_PLAYLIST_ID');
    await this.playlistStatsService.upsertPlaylist(playlist);
    const today = new Date();
    for (const [index, track] of tracks.entries()) {
      await this.trackService.createTrack(track);
      try {
        await this.trackService.createTrackPlaylistPosition(
          track,
          today,
          playlistId,
          index,
        );
      } catch (error) {
        throw new Error(error.message);
      }
    }
    console.log('DB updated');
  }
}
