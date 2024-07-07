import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  async sendEmail(email: string, subject: string, message: string) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.yandex.ru',
      port: 465,
      secure: true, // true для 465, false для других портов
      auth: {
        user: 'avabacktest@yandex.ru',
        pass: 'teabnbflhelvhlgy',
      },
    });

    const info = await transporter.sendMail({
      from: 'TgExample <avabacktest@yandex.ru>',
      to: email,
      subject: subject,
      html: message,
    });

    return info;
  }
}
