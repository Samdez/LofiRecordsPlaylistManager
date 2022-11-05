import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SpotifyAPIService } from 'src/SpotifyAPI/spotifyApi.service';

@Injectable()
export class AuthService {
  @Inject(ConfigService)
  public config: ConfigService;
  constructor(private readonly spotifyApiService: SpotifyAPIService) {}

  async grantAuthorization() {
    this.spotifyApiService.spotifyApi
      .authorizationCodeGrant(this.config.get('SPOTIFY_ACCESS_CODE'))
      .then((data) => {
        const access_token = data.body['access_token'];
        const refresh_token = data.body['refresh_token'];
        const expires_in = data.body['expires_in'];

        this.spotifyApiService.spotifyApi.setAccessToken(access_token);
        this.spotifyApiService.spotifyApi.setRefreshToken(refresh_token);

        console.log(
          `Sucessfully retreived access token. Expires in ${expires_in} s.`,
        );

        setInterval(async () => {
          const data =
            await this.spotifyApiService.spotifyApi.refreshAccessToken();
          const access_token = data.body['access_token'];

          console.log('The access token has been refreshed!');
          this.spotifyApiService.spotifyApi.setAccessToken(access_token);
        }, (expires_in / 2) * 1000);
      })
      .catch((error) => {
        throw new Error(error.message);
      });
  }

  async refreshTokens() {
    try {
      const response =
        await this.spotifyApiService.spotifyApi.refreshAccessToken();
      const { access_token, refresh_token } = response.body;

      this.spotifyApiService.spotifyApi.setAccessToken(access_token);
      this.spotifyApiService.spotifyApi.setRefreshToken(refresh_token);
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
