import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { EnvConfiguration } from './config/app.config';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvConfiguration],
    }),
    MongooseModule.forRoot(process.env.MONGO_DB_URI, {
      dbName: 'verifyarcadb',
    }),
    CommonModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
