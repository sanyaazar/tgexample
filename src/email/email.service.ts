import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {}

  async sendEmail(email: string, subject: string, message: string) {
    const transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_SMTP'),
      port: 465,
      secure: true, // true для 465, false для других портов
      auth: {
        user: this.configService.get<string>('EMAIL_ADDRESS'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });

    const info = await transporter.sendMail({
      from: this.configService.get<string>('EMAIL_FROM'),
      to: email,
      subject: subject,
      html: message,
    });

    return info;
  }
}
