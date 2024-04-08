// src/email/email.module.ts
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import * as nodemailer from 'nodemailer';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [
    MailService,
    {
      provide: 'MAILER_TRANSPORT',
      useFactory: async (configService: ConfigService) => {
        const transporter = nodemailer.createTransport({
          host: `${configService.get('EMAIL_HOST')}`,
          port: 465,
          secure: true,
          auth: {
            user: `${configService.get('EMAIL_USER')}`,
            pass: `${configService.get('EMAIL_PASSWORD')}`,
          },
        });

        return transporter;
      },
      inject: [ConfigService],
    },
  ],
  exports: [MailService],
})
export class MailModule {}
