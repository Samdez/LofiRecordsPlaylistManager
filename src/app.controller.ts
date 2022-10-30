import { Controller, Get, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  startProcess() {
    return this.appService.startProcess();
  }

  @Get('me')
  getMe() {
    return this.appService.getUser();
  }

  @Get('playlists')
  getPlaylists() {
    return this.appService.getUserPlaylists();
  }
}
