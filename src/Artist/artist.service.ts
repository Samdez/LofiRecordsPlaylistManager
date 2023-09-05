import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/Prisma/prisma.service';

@Injectable()
export class ArtistService {
  constructor(private prisma: PrismaService) {}

  indexArtists() {
    return this.prisma.artist.findMany({});
  }

  getArtist(artistWhereUniqueInput: Prisma.ArtistWhereUniqueInput) {
    return this.prisma.artist.findUnique({
      where: artistWhereUniqueInput,
    });
  }

  createArtist(data: Prisma.ArtistCreateInput) {
    return this.prisma.artist.create({ data });
  }

  createArtists(data: Prisma.ArtistCreateManyInput[]) {
    return this.prisma.artist.createMany({
      data,
    });
  }
}
