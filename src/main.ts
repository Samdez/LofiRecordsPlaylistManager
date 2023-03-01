import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { AppService } from './app.service';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  // await app.listen(3000);
  // console.log(`App running on port 3000`);
  await NestFactory.createApplicationContext(AppModule);
  console.log('App running');
}
bootstrap();
