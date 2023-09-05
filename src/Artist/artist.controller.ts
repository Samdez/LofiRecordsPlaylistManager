import { Controller, Get } from '@nestjs/common';
import { ArtistService } from './artist.service';

@Controller('artists')
export class ArtistController {
  constructor(private artistService: ArtistService) {}
  @Get()
  getArtists() {
    return this.artistService.indexArtists();
  }
}
