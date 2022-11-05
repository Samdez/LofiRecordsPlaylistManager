import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PlaylistService } from './Playlist/playlist.service';
import { UserService } from './User/user.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly userService: UserService,
    private readonly playlistService: PlaylistService,
  ) {}

  @Get()
  startProcess() {
    return this.appService.startProcess();
  }

  @Get('me')
  getMe() {
    return this.userService.getUser();
  }

  @Get('playlists')
  getPlaylists() {
    return this.playlistService.getUserPlaylists();
  }
}
