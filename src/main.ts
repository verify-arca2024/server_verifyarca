import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');



  // Check if the port is set in the environment variables
  if (process.env.PORT) {
    Logger.log(`Port is set to ${process.env.PORT}`, 'Bootstrap');
  } else {
    Logger.log('Port is not set, using default port 3000', 'Bootstrap');
    process.env.PORT = '3000';
  }

  await app.listen(process.env.PORT);
  Logger.log(
    `Server running on http://localhost:${process.env.PORT}`,
    'Bootstrap',
  );
}
bootstrap();
