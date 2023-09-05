import { Module } from '@nestjs/common';
import { TrackService } from './track.service';
import { PrismaModule } from 'src/Prisma/prisma.module';
import { TrackController } from './track.controller';

@Module({
  imports: [PrismaModule],
  controllers: [TrackController],
  providers: [TrackService],
  exports: [TrackService],
})
export class TrackModule {}
