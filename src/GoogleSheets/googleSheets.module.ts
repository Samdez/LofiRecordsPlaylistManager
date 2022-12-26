import { Module } from '@nestjs/common';
import { GoogleSheetsService } from './googleSheets.service';

@Module({
  imports: [],
  controllers: [],
  providers: [GoogleSheetsService],
  exports: [GoogleSheetsService],
})
export class GoogleSheetsModule {}
