// src/email/mail.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { Transporter } from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import { promisify } from 'util';
import { join } from 'path';

@Injectable()
export class MailService {
  constructor(
    @Inject('MAILER_TRANSPORT') private readonly transporter: Transporter,
  ) {}

  async sendWelcomeEmail(to: string, code: string) {
    console.log('Enviando correo de bienvenida a:', to);
    const subject = 'VerifyArca - Código de Registro';
    const html = await this.renderTemplate('welcome', { code });

    await this.sendEmail(to, subject, html);
  }

  async sendLoginCodeEmail(to: string, code: string) {
    console.log('Enviando correo de código de inicio de sesión a:', to);
    const subject = 'VerifyArca - Codigo de Inicio de Sesión';
    const html = await this.renderTemplate('loginCode', { code });

    await this.sendEmail(to, subject, html);
  }

  async resendCodeRegisterEmail(to: string, code: string) {
    console.log('Reenviando correo de código de registro a:', to);
    const subject = 'VerifyArca - Reenvio de Código de Registro';
    const html = await this.renderTemplate('resendRegisterCode', { code });

    await this.sendEmail(to, subject, html);
  }

  async resendCodeLoginEmail(to: string, code: string) {
    console.log('Reenviando correo de código de inicio de sesión a:', to);
    const subject = 'VerifyArca - Reenvio de Código de Inicio de Sesión';
    const html = await this.renderTemplate('resendLoginCode', { code });

    await this.sendEmail(to, subject, html);
  }

  //Metodos privados para enviar el correo y renderizar la plantilla
  private async sendEmail(to: string, subject: string, html: string) {
    const fromEmail = this.transporter.options.auth.user;
    const mailOptions = {
      from: `<${fromEmail}>`,
      to,
      subject,
      html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Correo electrónico de bienvenida enviado a:', to);
      return info;
    } catch (error) {
      console.error(
        'Error al enviar el correo electrónico de bienvenida:',
        error,
      );
      throw error;
    }
  }

  private async renderTemplate(
    template: string,
    context: any,
  ): Promise<string> {
    const readFileAsync = promisify(fs.readFile);
    const templatePath = join(
      __dirname,
      '..',
      'mail',
      'templates',
      `${template}.hbs`,
    );

    try {
      const templateContent = await readFileAsync(templatePath, 'utf8');
      const compiledTemplate = handlebars.compile(templateContent);
      return compiledTemplate(context);
    } catch (error) {
      console.error('Error al renderizar la plantilla:', error);
      throw error;
    }
  }
}
