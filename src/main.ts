import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(morgan('dev'));
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

  //Cors - Cross Origin Resource Sharing - Habilitar CORS - Permitir que otros dominios puedan acceder a nuestra API
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
  });

  const configService = app.get(ConfigService);

  if (configService.get('PORT')) {
    Logger.log(`Port is set to ${configService.get('PORT')}`, 'Bootstrap');
  } else {
    Logger.log('Port is not set, using default port 3000', 'Bootstrap');
    configService.set('PORT', '3000');
  }

  await app.listen(configService.get('PORT'));
  Logger.log(
    `Server running on http://localhost:${configService.get('PORT')}`,
    'Bootstrap',
  );
}
bootstrap();
