import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/Auth/auth.service';
import { SpotifyAPIService } from 'src/SpotifyAPI/spotifyApi.service';

@Injectable()
export class UserService {
  constructor(
    private readonly authService: AuthService,
    private readonly spotifyAPIService: SpotifyAPIService,
  ) {}
  async getUser() {
    this.spotifyAPIService.initClient();

    try {
      const res = await this.spotifyAPIService.spotifyApi.getMe();
      return res.body;
    } catch (error) {
      await this.authService.refreshTokens();

      const res = await this.spotifyAPIService.spotifyApi.getMe();
      return res.body;
    }
  }
}
