import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { getEnvPath } from '../common/helper/env.helper';

const envFilePath: string = getEnvPath(`${__dirname}/common/envs`);

@Module({
  imports: [ConfigModule.forRoot({ envFilePath, isGlobal: true })],
  controllers: [],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
