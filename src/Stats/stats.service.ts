import { Injectable } from '@nestjs/common';
import { ArtistTrackCount } from 'src/Playlist/playlist.service';
import { TrackService } from 'src/Track/track.service';

@Injectable()
export class StatsService {
  constructor(private readonly trackService: TrackService) {}

  orderArtistsByNumberOfTracks(artistsTrackCount: ArtistTrackCount) {
    return Object.values(artistsTrackCount).sort((a, b) => b.points - a.points);
  }

  async updateStats(tracks: SpotifyApi.PlaylistTrackObject[]) {
    for (const track of tracks) {
      await this.trackService.createTrack(track);
    }
    console.log('DB updated');
  }
}
