import { Injectable } from '@nestjs/common';
import { EmailConfigService } from '../../config/config-services/email-config.service';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(
    private emailConfigService: EmailConfigService,
    private mailerService: MailerService,
  ) {}

  async sendEmail(email: string, subject: string, message: string) {
    const transporter = this.mailerService.addTransporter('gmail', {
      service: 'gmail',
      auth: {
        user: this.emailConfigService.gmailAuthLogin,
        pass: this.emailConfigService.gmailAuthPassword,
      },
    });

    const info = await this.mailerService.sendMail({
      from: `"Igor 👻" <${this.emailConfigService.gmailAuthLogin}>`, // sender address
      to: email, // list of receivers
      subject: `${subject} ✔`, // Subject line
      html: message, // html body
    });

    return info;
  }
}
