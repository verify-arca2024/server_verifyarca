import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { MailModule } from './mail/mail.module';
import { CountriesModule } from './countries/countries.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env`],
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_DB_URI, {
      dbName: 'verifyarcadb',
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    CommonModule,
    UsersModule,
    AuthModule,
    MailModule,
    CountriesModule,
    SeedModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
