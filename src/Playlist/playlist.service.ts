import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/Auth/auth.service';
import { SpotifyAPIService } from 'src/SpotifyAPI/spotifyApi.service';
import { StatsService } from 'src/Stats/stats.service';

export interface ArtistTrackCount {
  [artistId: string]: { points: number; name: string };
}

@Injectable()
export class PlaylistService {
  @Inject(ConfigService)
  public config: ConfigService;
  constructor(
    private readonly authService: AuthService,
    private readonly spotifyApiService: SpotifyAPIService,
    private readonly statsService: StatsService,
  ) {}

  async getUserPlaylists() {
    this.spotifyApiService.initClient();
    const userId = this.authService.config.get('SPOTIFY_USER_ID');
    try {
      const res = await this.spotifyApiService.spotifyApi.getUserPlaylists(
        userId,
      );
      return res.body;
    } catch (error) {
      await this.authService.refreshTokens();
      const res = await this.spotifyApiService.spotifyApi.getUserPlaylists(
        userId,
      );
      return res.body;
    }
  }

  async getPlaylist(playlistId?: string) {
    this.spotifyApiService.initClient();
    try {
      const res = await this.spotifyApiService.spotifyApi.getPlaylist(
        playlistId || this.config.get('MAIN_PLAYLIST_ID'),
      );
      return res.body;
    } catch (error) {
      await this.authService.refreshTokens();
      const res = await this.spotifyApiService.spotifyApi.getPlaylist(
        this.config.get('MAIN_PLAYLIST_ID'),
      );
      return res.body;
    }
  }

  async getPlaylistTracks(playlistId: string) {
    try {
      const res = await this.getTracks(playlistId);
      return res;
    } catch (error) {
      await this.authService.refreshTokens();

      const res = await this.getTracks(playlistId);
      return res;
    }
  }

  async getTracks(playlistId: string) {
    const data = await this.spotifyApiService.spotifyApi.getPlaylistTracks(
      playlistId,
    );
    const numBatches = Math.floor(data.body.total / 100) + 1;
    const promises = [];
    for (let batchNum = 0; batchNum < numBatches; batchNum++) {
      const promise = await this.spotifyApiService.spotifyApi.getPlaylistTracks(
        playlistId,
        {
          offset: batchNum * 100,
        },
      );
      promises.push(promise);
    }
    const rawSongData = await Promise.all(promises);
    let songs: SpotifyApi.PlaylistTrackObject[] = [];
    for (let i = 0; i < rawSongData.length; i++) {
      songs = songs.concat(rawSongData[i].body.items);
    }
    return songs;
  }

  filterOutTracks(
    tracks: SpotifyApi.PlaylistTrackObject[],
    tracksToExclude: SpotifyApi.PlaylistTrackObject[],
  ) {
    const tempTracksIds = tracksToExclude.map((track) => track.track.id);
    return tracks.filter((track) => !tempTracksIds.includes(track.track.id));
  }

  async organizePlaylist(
    promotionOneTracks: SpotifyApi.PlaylistTrackObject[],
    promotionTwoTracks: SpotifyApi.PlaylistTrackObject[],
    compilationTracks: SpotifyApi.PlaylistTrackObject[],
    favoritesTracks: SpotifyApi.PlaylistTrackObject[],
    releasesTracks: SpotifyApi.PlaylistTrackObject[],
    temporaryTracks: SpotifyApi.PlaylistTrackObject[],
  ) {
    promotionOneTracks = this.filterOutTracks(
      promotionOneTracks,
      temporaryTracks,
    );
    promotionTwoTracks = this.filterOutTracks(
      promotionTwoTracks,
      temporaryTracks,
    );
    compilationTracks = this.filterOutTracks(
      compilationTracks,
      temporaryTracks,
    );
    favoritesTracks = this.filterOutTracks(favoritesTracks, temporaryTracks);
    releasesTracks = this.filterOutTracks(releasesTracks, temporaryTracks);
    const shuffledCompTracks = this.shuffleTracks(compilationTracks);
    const shuffledFavoritesTracks = this.shuffleTracks(favoritesTracks);
    const shuffledReleasesTracks = this.getNRandomTracksPerAlbum(
      releasesTracks,
      1,
    ).sort(
      (a, b) =>
        new Date(b.track.album.release_date).getTime() -
        new Date(a.track.album.release_date).getTime(),
    );
    const [catOneP1Tracks, catOneP2Tracks, catOneCompTracks] =
      this.getCategoryOneTracks(
        promotionOneTracks,
        promotionTwoTracks,
        compilationTracks,
      );
    const [catTwoP1Tracks, catTwoP2Tracks, catTwoCompTracks] =
      this.getCategoryTwoTracks(
        promotionOneTracks,
        promotionTwoTracks,
        shuffledCompTracks,
      );
    const catOneTracks = [
      ...catOneP1Tracks,
      ...catOneP2Tracks,
      ...catOneCompTracks,
    ];
    const catTwoTracks = [
      ...catTwoP1Tracks,
      ...catTwoP2Tracks,
      ...catTwoCompTracks,
    ];

    const favoriteTracksWithoutCatOne = this.filterOutTracks(
      shuffledFavoritesTracks,
      catOneTracks,
    );
    const favoriteTracksWithoutCatOneAndTwo = this.filterOutTracks(
      favoriteTracksWithoutCatOne,
      catTwoTracks,
    );
    const releaseTracksWithoutCatOne = this.filterOutTracks(
      shuffledReleasesTracks,
      catOneTracks,
    );
    const releaseTracksWithoutCatOneAndTwo = this.filterOutTracks(
      releaseTracksWithoutCatOne,
      catTwoTracks,
    );

    const numOfFavTracksToAddToCatOne =
      170 -
      (catOneP1Tracks.length +
        catOneP2Tracks.length +
        catOneCompTracks.length +
        temporaryTracks.length);

    const {
      favTracksToAddToCatOne,
      favTracksToAddToCatTwo,
      releasesTrackToAddToCatTwo,
      artistsTrackCount,
    } = await this.addTracksFromFavoritesAndReleases({
      catOneCompTracks,
      catTwoP1Tracks,
      catTwoP2Tracks,
      catTwoCompTracks,
      favoritesTracks: favoriteTracksWithoutCatOneAndTwo,
      releasesTracks: releaseTracksWithoutCatOneAndTwo,
      numOfFavTracksToAddToCatOne,
    });

    const updatedCatOneTracks = this.shuffleTracks([
      ...catOneP1Tracks,
      ...catOneP2Tracks,
      ...catOneCompTracks,
      ...temporaryTracks,
      ...favTracksToAddToCatOne,
    ]);
    const updatedCatTwoTracks = this.shuffleTracks([
      ...catTwoP1Tracks,
      ...catTwoP2Tracks,
      ...catTwoCompTracks,
      ...favTracksToAddToCatTwo,
      ...releasesTrackToAddToCatTwo,
    ]);
    const newPlaylist = [...updatedCatOneTracks, ...updatedCatTwoTracks];

    const catOneTracksUris = updatedCatOneTracks.map(
      (track) => track.track.uri,
    );
    const catTwoTracksUris = updatedCatTwoTracks.map(
      (track) => track.track.uri,
    );
    const tracksUris = [...catOneTracksUris, ...catTwoTracksUris];
    const hasDuplicate = new Set(tracksUris).size !== tracksUris.length;

    if (hasDuplicate) {
      console.log('Duplicates found!');
      // const uniques = new Set(tracksUris);
      // const duplicates = tracksUris.filter((track) => {
      //   if (uniques.has(track)) {
      //     uniques.delete(track);
      //   } else {
      //     return track;
      //   }
      // });
      // console.log(duplicates);
      // for (const duplicate of duplicates) {
      //   const track = await this.spotifyApiService.spotifyApi.getTrack(
      //     duplicate.split(':')[2],
      //   );
      //   console.log(track.body.name);
      // }

      await this.organizePlaylist(
        promotionOneTracks,
        promotionTwoTracks,
        compilationTracks,
        favoritesTracks,
        releasesTracks,
        temporaryTracks,
      );
    } else if (tracksUris.length < 500) {
      console.log('Not enough tracks!');

      await this.organizePlaylist(
        promotionOneTracks,
        promotionTwoTracks,
        compilationTracks,
        favoritesTracks,
        releasesTracks,
        temporaryTracks,
      );
    } else {
      const playlistId = this.config.get('MAIN_PLAYLIST_ID');
      const spotifyPlaylistInfo = await this.getPlaylist(playlistId);
      const promises = [
        this.updateMainPlaylist(tracksUris),
        this.statsService.updateStats(newPlaylist, spotifyPlaylistInfo),
      ];
      await Promise.all(promises);
      console.log('End of the process');
    }
  }

  getCategoryOneTracks(
    promotionOneTracks: SpotifyApi.PlaylistTrackObject[],
    promotionTwoTracks: SpotifyApi.PlaylistTrackObject[],
    compilationTracks: SpotifyApi.PlaylistTrackObject[],
  ) {
    const categoryOneTracksFromPlaylistOne =
      this.filterTracksPerDaysSinceReleaseDate(
        promotionOneTracks,
        this.config.get('DAYS_IN_FIRST_CATEGORY_FOR_PROMOTION_ONE'),
        'before',
      );
    const categoryOneTracksFromPlaylistTwo =
      this.getCategoryOneTracksFromPlaylistTwo(promotionTwoTracks);
    const categoryOneTrackFromCompilationPlaylist =
      this.filterTracksPerDaysSinceReleaseDate(
        compilationTracks,
        this.config.get('DAYS_IN_FIRST_CATEGORY_FOR_COMPILATION'),
        'before',
      );

    return [
      categoryOneTracksFromPlaylistOne,
      categoryOneTracksFromPlaylistTwo,
      categoryOneTrackFromCompilationPlaylist,
    ];
  }

  getCategoryTwoTracks(
    promotionOneTracks: SpotifyApi.PlaylistTrackObject[],
    promotionTwoTracks: SpotifyApi.PlaylistTrackObject[],
    compilationTracks: SpotifyApi.PlaylistTrackObject[],
  ) {
    const categoryTwoTracksFromPlaylistOne =
      this.filterTracksPerDaysSinceReleaseDate(
        promotionOneTracks,
        this.config.get('DAYS_IN_FIRST_CATEGORY_FOR_PROMOTION_ONE'),
        'after',
      );
    const selectedCategoryTwoTracksFromPlaylistOne =
      this.getNRandomTracksPerAlbum(categoryTwoTracksFromPlaylistOne, 1);

    const categoryTwoTracksFromPlaylistTwo =
      this.filterTracksPerDaysSinceReleaseDate(
        promotionTwoTracks,
        this.config.get('DAYS_IN_FIRST_CATEGORY_FOR_PROMOTION_TWO'),
        'after',
      );
    const selectedCategoryTwoTracksFromPlaylistTwo =
      this.getNRandomTracksPerAlbum(categoryTwoTracksFromPlaylistTwo, 1);

    const categoryTwoTracksFromCompilationPlaylist = compilationTracks.slice(
      0,
      50,
    );

    return [
      selectedCategoryTwoTracksFromPlaylistOne,
      selectedCategoryTwoTracksFromPlaylistTwo,
      categoryTwoTracksFromCompilationPlaylist,
    ];
  }

  async updateMainPlaylist(tracksUris: string[]) {
    let {
      snapshot_id,
      // eslint-disable-next-line prefer-const
      tracks: { total: playlistLength },
    } = await this.getPlaylist();
    const quotient = Math.floor(playlistLength / 100);
    const remainder = playlistLength % 100;
    for (let i = 0; i < quotient; i++) {
      try {
        const arr = [];
        for (let j = 0; j < 100; j++) {
          arr.push(j);
        }
        const res =
          await this.spotifyApiService.spotifyApi.removeTracksFromPlaylistByPosition(
            this.config.get('MAIN_PLAYLIST_ID'),
            arr,
            snapshot_id,
          );
        snapshot_id = res.body.snapshot_id;
      } catch (error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
    if (remainder) {
      try {
        const arr = [];
        for (let j = 0; j < remainder; j++) {
          arr.push(j);
        }
        const res =
          await this.spotifyApiService.spotifyApi.removeTracksFromPlaylistByPosition(
            this.config.get('MAIN_PLAYLIST_ID'),
            arr,
            snapshot_id,
          );
        snapshot_id = res.body.snapshot_id;
      } catch (error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
    console.log('playlist deleted');

    for (let i = 0; i < 5; i++) {
      try {
        const tracksToAdd = tracksUris.slice(0, 100);
        let res2: any;
        try {
          res2 = await this.spotifyApiService.spotifyApi.addTracksToPlaylist(
            this.config.get('MAIN_PLAYLIST_ID'),
            tracksToAdd,
          );
        } catch (error) {
          throw new HttpException(
            error.message,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
        snapshot_id = res2.body.snapshot_id;
        tracksUris = tracksUris.slice(100);
      } catch (error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
    console.log('Playlist updated!');
  }

  getCategoryOneTracksFromPlaylistTwo(
    tracks: SpotifyApi.PlaylistTrackObject[],
  ) {
    const filteredTracksByDate = this.filterTracksPerDaysSinceReleaseDate(
      tracks,
      this.config.get('DAYS_IN_FIRST_CATEGORY_FOR_PROMOTION_TWO'),
      'before',
    );

    const selectedTracks = this.getNRandomTracksPerAlbum(
      filteredTracksByDate,
      6,
    );
    return selectedTracks;
  }

  getNRandomTracksPerAlbum(
    tracks: SpotifyApi.PlaylistTrackObject[],
    numberOfTracks: number,
  ) {
    const playlistAlbums: {
      [albumId: string]: SpotifyApi.PlaylistTrackObject[];
    } = {};

    tracks.forEach((track) => {
      const { album } = track.track;
      if (playlistAlbums[album.id]) {
        playlistAlbums[album.id].push(track);
      } else {
        playlistAlbums[album.id] = [];
        playlistAlbums[album.id].push(track);
      }
    });

    const selectedTracks = Object.entries(playlistAlbums).map(
      ([albumId, tracks]) => {
        const albumRandomized = this.shuffleTracks(tracks);
        return albumRandomized.slice(0, numberOfTracks);
      },
    );

    return selectedTracks.flat();
  }

  filterTracksPerDaysSinceReleaseDate(
    tracks: SpotifyApi.PlaylistTrackObject[],
    daysSinceReleaseDate: number,
    limit: 'before' | 'after',
  ) {
    const date = new Date();
    const recentTracks = tracks.filter((track) => {
      const trackReleaseDate = new Date(track.track.album.release_date);
      const daysSinceRelease = Math.floor(
        (date.getTime() - trackReleaseDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (limit === 'before') {
        if (daysSinceRelease <= daysSinceReleaseDate) {
          return track;
        }
      }
      if (limit === 'after') {
        if (daysSinceRelease > daysSinceReleaseDate) {
          return track;
        }
      }
    });
    return recentTracks;
  }

  shuffleTracks(playlist: SpotifyApi.PlaylistTrackObject[]) {
    for (let i = playlist.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = playlist[i];
      playlist[i] = playlist[j];
      playlist[j] = temp;
    }
    return playlist;
  }

  async addTracksFromFavoritesAndReleases({
    catOneCompTracks,
    catTwoP1Tracks,
    catTwoP2Tracks,
    catTwoCompTracks,
    favoritesTracks,
    releasesTracks,
    numOfFavTracksToAddToCatOne,
  }: {
    catOneCompTracks: SpotifyApi.PlaylistTrackObject[];
    catTwoP1Tracks: SpotifyApi.PlaylistTrackObject[];
    catTwoP2Tracks: SpotifyApi.PlaylistTrackObject[];
    catTwoCompTracks: SpotifyApi.PlaylistTrackObject[];
    favoritesTracks: SpotifyApi.PlaylistTrackObject[];
    releasesTracks: SpotifyApi.PlaylistTrackObject[];
    numOfFavTracksToAddToCatOne: number;
  }) {
    // count tracks per artist for compilation + P1Cat2 + P2Cat2
    const compAndPromTracks = [
      ...catTwoCompTracks,
      ...catTwoP1Tracks,
      ...catTwoP2Tracks,
      ...catOneCompTracks,
    ];
    const [artistTrackCountWithCompAndProm] =
      this.createOrUpdateArtistTrackCount(compAndPromTracks);

    //add 55 favs to cat2
    const [artistTracksCountWithCat2Favs, favTracksToAddToCatTwo] =
      this.createOrUpdateArtistTrackCount(
        favoritesTracks,
        artistTrackCountWithCompAndProm,
        this.config.get('TRACKS_FROM_FAVORITES_IN_CATEGORY_TWO'),
      );

    //add n favs to cat1
    const remainingFavTracks = favoritesTracks.filter(
      (track) => !favTracksToAddToCatTwo.includes(track),
    );
    const [artistTrackCountWithCat1Favs, favTracksToAddToCatOne] =
      this.createOrUpdateArtistTrackCount(
        remainingFavTracks,
        artistTracksCountWithCat2Favs,
        numOfFavTracksToAddToCatOne,
      );

    //add n releases to cat2
    const catTwoWithoutReleases = [
      ...catTwoP1Tracks,
      ...catTwoP2Tracks,
      ...catTwoCompTracks,
      ...favTracksToAddToCatTwo,
    ];
    const numOfReleasesToAddToCat2 = 330 - catTwoWithoutReleases.length;
    const [artistsTrackCountWithFullCat2, releasesTrackToAddToCatTwo] =
      this.createOrUpdateArtistTrackCount(
        releasesTracks,
        artistTrackCountWithCat1Favs,
        numOfReleasesToAddToCat2,
      );

    return {
      favTracksToAddToCatOne,
      favTracksToAddToCatTwo,
      releasesTrackToAddToCatTwo,
      artistsTrackCount: artistsTrackCountWithFullCat2,
    };
  }

  createOrUpdateArtistTrackCount(
    playlist: SpotifyApi.PlaylistTrackObject[],
    artistTrackCount?: ArtistTrackCount,
    counter?: number,
  ): [ArtistTrackCount, SpotifyApi.PlaylistTrackObject[]] {
    const newArtistsTrackCount: ArtistTrackCount =
      { ...artistTrackCount } || {};
    const tracksToAdd: SpotifyApi.PlaylistTrackObject[] = [];
    for (let i = 0; i < (counter || playlist.length); i++) {
      const track = playlist[i];
      const artists = track.track.artists.map((el) => el);
      const isCollab = artists.length > 1;
      let isUnderLimit = true;
      for (let j = 0; j < artists.length; j++) {
        if (
          newArtistsTrackCount[artists[j].id]?.points >=
          this.config.get('MAX_NUMBER_OF_POINTS_PER_ARTIST')
        ) {
          isUnderLimit = false;
        } else if (!newArtistsTrackCount[artists[j].id]) {
          isCollab
            ? (newArtistsTrackCount[artists[j].id] = {
                points: 0.5,
                name: artists[j].name,
              })
            : (newArtistsTrackCount[artists[j].id] = {
                points: 1,
                name: artists[j].name,
              });
        } else {
          isCollab
            ? (newArtistsTrackCount[artists[j].id].points += 0.5)
            : (newArtistsTrackCount[artists[j].id].points += 1);
        }
      }
      isUnderLimit && tracksToAdd.push(track);
    }

    return [newArtistsTrackCount, tracksToAdd];
  }

  parseTrack(track: SpotifyApi.PlaylistTrackObject, fromPlaylist: string) {
    return {
      name: track.track.name,
      artists: track.track.artists,
      releaseDate: track.track.album.release_date,
      fromPlaylist,
    };
  }
}
