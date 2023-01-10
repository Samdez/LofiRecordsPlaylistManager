import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './Auth/auth.service';
import { PlaylistService } from './Playlist/playlist.service';
import { UserService } from './User/user.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly userService: UserService,
    private readonly playlistService: PlaylistService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  startProcess() {
    return this.appService.startProcess();
  }

  @Get('me')
  getMe() {
    return this.userService.getUser();
  }

  @Get('authorize')
  authorize() {
    return this.authService.grantAuthorization();
  }
  @Get('code')
  getCode() {
    return this.authService.getCode();
  }

  @Get('playlists')
  getPlaylists() {
    return this.playlistService.getUserPlaylists();
  }
}
