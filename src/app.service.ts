import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AuthService } from './Auth/auth.service';
import { UserService } from './User/user.service';
// import SpotifyWebApi from 'spotify-web-api-node';

// const scopes = [
//   'user-read-private',
//   'user-read-email',
//   'playlist-read-private',
//   'playlist-read-collaborative',
//   'playlist-modify-private',
//   'playlist-modify-public',
// ];

// interface CustomSpotifyWebApi extends SpotifyWebApi {
//   _credentials?: {
//     accessToken: string;
//     clientId: string;
//     clientSecret: string;
//     redirectUri: string;
//     refreshToken: string;
//   };
// }

@Injectable()
export class AppService {
  // @Inject(ConfigService)
  // public config: ConfigService;
  // spotifyApi: CustomSpotifyWebApi;
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  // initClient() {
  //   this.spotifyApi = new SpotifyWebApi({
  //     clientId: this.config.get('CLIENT_ID'),
  //     clientSecret: this.config.get('CLIENT_SECRET'),
  //     redirectUri: 'http://www.example.com/callback',
  //     accessToken:
  //       this.spotifyApi?._credentials.accessToken ||
  //       this.config.get('ACCESS_TOKEN'),
  //     refreshToken:
  //       this.spotifyApi?._credentials.refreshToken ||
  //       this.config.get('REFRESH_TOKEN'),
  //   });
  // }

  async startProcess() {
    await this.authService.grantAuthorization();
  }

  // async refreshTokens() {
  //   try {
  //     const response = await this.spotifyApi.refreshAccessToken();
  //     const { access_token, refresh_token } = response.body;

  //     this.spotifyApi.setAccessToken(access_token);
  //     this.spotifyApi.setRefreshToken(refresh_token);
  //   } catch (error) {
  //     throw new Error(error.message);
  //   }
  // }

  async getUser() {
    this.authService.initClient();

    try {
      const res = await this.authService.spotifyApi.getMe();
      return res.body;
    } catch (error) {
      await this.authService.refreshTokens();

      const res = await this.authService.spotifyApi.getMe();
      return res.body;
    }
  }

  async getUserPlaylists() {
    this.authService.initClient();
    const userId = this.authService.config.get('SPOTIFY_USER_ID');
    try {
      const res = await this.authService.spotifyApi.getUserPlaylists(userId);
      return res.body;
    } catch (error) {
      await this.authService.refreshTokens();
      const res = await this.authService.spotifyApi.getUserPlaylists(userId);
      return res.body;
    }
  }
}
