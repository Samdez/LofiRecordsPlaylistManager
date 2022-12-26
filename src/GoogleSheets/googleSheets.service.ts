import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GoogleSpreadsheet,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet';
import { ArtistTrackCount } from 'src/Playlist/playlist.service';

@Injectable()
export class GoogleSheetsService {
  @Inject(ConfigService)
  public config: ConfigService;
  creds: {
    type: string;
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
  };

  async createSheet({
    catOneP1Tracks,
    catOneP2Tracks,
    catOneCompTracks,
    catOneFavTracks,
    catOneTempTracks,
    catTwoP1Tracks,
    catTwoP2Tracks,
    catTwoCompTracks,
    catTwoFavTracks,
    catTwoReleasesTracks,
  }) {
    const creds = {
      type: this.config.get('GOOGLE_SHEETS_TYPE'),
      project_id: this.config.get('GOOGLE_SHEETS_PROJECT_ID'),
      private_key_id: this.config.get('GOOGLE_SHEETS_PRIVATE_KEY_ID'),
      private_key: this.config
        .get('GOOGLE_SHEETS_PRIVATE_KEY')
        .replace(/\\n/g, '\n'),
      client_email: this.config.get('GOOGLE_SHEETS_CLIENT_EMAIL'),
    };

    const doc = new GoogleSpreadsheet(this.config.get('GOOGLE_SHEET_ID'));
    await doc.useServiceAccountAuth(creds);

    // create a sheet and set the header row
    const sheet = await doc.addSheet({
      headerValues: ['artist', 'trackName', 'album', 'fromPlaylist'],
      title: new Date().toLocaleString('fr').replaceAll(':', '/'),
    });

    await this.createRowsForPlaylist(catOneP1Tracks, 'CatOneP1', sheet);
    await this.createRowsForPlaylist(catOneP2Tracks, 'CatOneP2', sheet);
    await this.createRowsForPlaylist(catOneCompTracks, 'CatOneComp', sheet);
    await this.createRowsForPlaylist(catOneFavTracks, 'CatOneFav', sheet);
    await this.createRowsForPlaylist(catOneTempTracks, 'CatOneTemp', sheet);
    await this.createRowsForPlaylist(catTwoP1Tracks, 'catTwoP1', sheet);
    await this.createRowsForPlaylist(catTwoP2Tracks, 'catTwoP2', sheet);
    await this.createRowsForPlaylist(catTwoCompTracks, 'catTwoComp', sheet);
    await this.createRowsForPlaylist(catTwoFavTracks, 'catTwoFav', sheet);
    await this.createRowsForPlaylist(
      catTwoReleasesTracks,
      'catTwoReleases',
      sheet,
    );
  }

  async createTracksCountSheet(
    artistsTracksCount: { name: string; points: number }[],
  ) {
    const creds = {
      type: this.config.get('GOOGLE_SHEETS_TYPE'),
      project_id: this.config.get('GOOGLE_SHEETS_PROJECT_ID'),
      private_key_id: this.config.get('GOOGLE_SHEETS_PRIVATE_KEY_ID'),
      private_key: this.config
        .get('GOOGLE_SHEETS_PRIVATE_KEY')
        .replace(/\\n/g, '\n'),
      client_email: this.config.get('GOOGLE_SHEETS_CLIENT_EMAIL'),
    };

    const doc = new GoogleSpreadsheet(this.config.get('GOOGLE_SHEET_ID'));
    await doc.useServiceAccountAuth(creds);

    // create a sheet and set the header row
    const sheet = await doc.addSheet({
      headerValues: ['artist', 'points'],
      title: `${new Date()
        .toLocaleString('fr')
        .replaceAll(':', '/')}/ArtistsPointsCount`,
    });

    const rows = [];
    for (const artist of Object.values(artistsTracksCount)) {
      const row = {
        artist: artist.name,
        points: artist.points,
      };
      rows.push(row);
    }
    try {
      await sheet.addRows(rows);
    } catch (error) {
      throw new Error(error);
    }
  }

  async createRowsForPlaylist(
    playlistTracks: SpotifyApi.PlaylistTrackObject[],
    fromPlaylist: string,
    sheet: GoogleSpreadsheetWorksheet,
  ) {
    const rows = [];
    for (const track of playlistTracks) {
      const row = this.createPlaylistRow(track, fromPlaylist);
      rows.push(row);
    }
    try {
      await sheet.addRows(rows);
    } catch (error) {
      throw new Error(error);
    }
  }

  createPlaylistRow(
    track: SpotifyApi.PlaylistTrackObject,
    fromPlaylist: string,
  ) {
    return {
      artist: track.track.artists.map((el) => el.name).join(' '),
      trackName: track.track.name,
      album: track.track.album.name,
      fromPlaylist,
    };
  }
}
