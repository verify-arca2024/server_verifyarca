import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UsersSchema } from 'src/users/entities/user.model';
import { GoogleStrategy } from './strategies/GoogleStrategy';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { MailModule } from 'src/mail/mail.module';
dotenv.config();

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    {
      provide: 'AUTH_SERVICE',
      useClass: AuthService,
    },
  ],
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UsersSchema,
      },
    ]),
    JwtModule.register({ //TODO - CONFIGURAR LA VARIABLE DE ENTORNO.
      global: true,
      secret: process.env.SECRET_JWT,
      signOptions: { expiresIn: '60s' },
    }),
    MailModule,
  ],
})
export class AuthModule {
  constructor() {
    console.log('Auth Module');
    console.log(process.env.SECRET_JWT)
  }
}
