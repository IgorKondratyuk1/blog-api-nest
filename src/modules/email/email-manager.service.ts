import { Injectable } from '@nestjs/common';
import { EmailService } from './email.service';
import { User, UserDocument } from '../users/repository/mongoose/schemas/user.schema';
import UserModel from '../users/models/user.model';

@Injectable()
export class EmailManagerService {
  constructor(private emailService: EmailService) {}

  async sendEmailConfirmationMessage(user: UserModel | User) {
    const subject = 'Email Confirmation';
    const code = user.emailConfirmation.confirmationCode;

    const message = `
            <h1>Thank for your registration</h1>
                <p>To finish registration please follow the link below:
                <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
            </p>`;
    return await this.emailService.sendEmail(user.accountData.email, subject, message);
  }

  async sendPasswordRecoveryMessage(user: UserModel | User) {
    const subject = 'Password recovery';
    const message = `
           <h1>Password recovery</h1>
           <p>To finish password recovery please follow the link below:
              <a href='https://somesite.com/password-recovery?recoveryCode=${user.passwordRecovery.recoveryCode}'>recovery password</a>
          </p>`;
    return await this.emailService.sendEmail(user.accountData.email, subject, message);
  }
}
