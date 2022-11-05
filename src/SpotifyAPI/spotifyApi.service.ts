import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import SpotifyWebApi from 'spotify-web-api-node';

interface CustomSpotifyWebApi extends SpotifyWebApi {
  _credentials?: {
    accessToken: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    refreshToken: string;
  };
}

@Injectable()
export class SpotifyAPIService {
  @Inject(ConfigService)
  public config: ConfigService;
  spotifyApi: CustomSpotifyWebApi;

  initClient() {
    this.spotifyApi = new SpotifyWebApi({
      clientId: this.config.get('CLIENT_ID'),
      clientSecret: this.config.get('CLIENT_SECRET'),
      redirectUri: 'http://www.example.com/callback',
      accessToken:
        this.spotifyApi?._credentials.accessToken ||
        this.config.get('ACCESS_TOKEN'),
      refreshToken:
        this.spotifyApi?._credentials.refreshToken ||
        this.config.get('REFRESH_TOKEN'),
    });
  }
}
