import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';

@Module({
  imports: [],
  controllers: [],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
