import { Injectable } from '@nestjs/common';
import { ArtistTrackCount } from 'src/Playlist/playlist.service';

@Injectable()
export class StatsService {
  orderArtistsByNumberOfTracks(artistsTrackCount: ArtistTrackCount) {
    return Object.values(artistsTrackCount).sort((a, b) => b.points - a.points);
  }
}
