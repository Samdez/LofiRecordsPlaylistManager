import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { HttpService } from '@nestjs/axios';
// import { AppService } from 'src/app.service';
import SpotifyWebApi from 'spotify-web-api-node';

const scopes = [
  'user-read-private',
  'user-read-email',
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-private',
  'playlist-modify-public',
];

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
export class AuthService {
  @Inject(ConfigService)
  public config: ConfigService;
  spotifyApi: CustomSpotifyWebApi;

  async grantAuthorization() {
    this.spotifyApi
      .authorizationCodeGrant(
        'AQCTi1ddCzeLiERHwaxx-pP43_0lWF463TKo1lHI0YA8v0K9jXvzwWk-CKtaukAY-iJNTe9M4Z2MC-izpC6Y7bxzaPVk0m-USu0rjUuT83ug0tnDDL_1XCC6F4k_EoIUnWLPWjSzlcgRjnPAaXrrfAwndfNmvvVTNW06Y3nqK_ProKQ-r1lth_P-mXk8kj13S7QxzrUPg7u7EuMtitmI3Z_wjZf3_wWQBIL4Ik7RGJIhz9qON68Ks16B7r15XrWSBqXttrAVXKNvOeao52A-aOyn8tZObNNkE4nKAQfHyar9tkNreUqTxrBfBx-dgmSfnVB7hxszD4euRfxc9EbovuWCBi7Q4mPJXQ',
      )
      .then((data) => {
        const access_token = data.body['access_token'];
        const refresh_token = data.body['refresh_token'];
        const expires_in = data.body['expires_in'];

        this.spotifyApi.setAccessToken(access_token);
        this.spotifyApi.setRefreshToken(refresh_token);

        console.log('access_token:', access_token);
        console.log('refresh_token:', refresh_token);

        console.log(
          `Sucessfully retreived access token. Expires in ${expires_in} s.`,
        );

        setInterval(async () => {
          const data = await this.spotifyApi.refreshAccessToken();
          const access_token = data.body['access_token'];

          console.log('The access token has been refreshed!');
          console.log('access_token:', access_token);
          this.spotifyApi.setAccessToken(access_token);
        }, (expires_in / 2) * 1000);
      })
      .catch((error) => {
        throw new Error(error.message);
      });
  }

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

  async refreshTokens() {
    try {
      const response = await this.spotifyApi.refreshAccessToken();
      const { access_token, refresh_token } = response.body;

      this.spotifyApi.setAccessToken(access_token);
      this.spotifyApi.setRefreshToken(refresh_token);
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
