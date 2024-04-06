import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const configService = app.get(ConfigService);

  // Check if the port is set in the environment variables
  if (configService.get("PORT")) {
    Logger.log(`Port is set to ${configService.get('PORT')}`, 'Bootstrap');
  } else {
    Logger.log('Port is not set, using default port 3000', 'Bootstrap');
   configService.set('PORT', "3000") 
  }

  await app.listen(configService.get('PORT'));
  Logger.log(
    `Server running on http://localhost:${configService.get('PORT')}`,
    'Bootstrap',
  );
}
bootstrap();
