import { IsEmail, IsNotEmpty, Length, Validate } from 'class-validator';
import { EmailResendRule } from '../validators/resend-email.validator';

export class RegistrationEmailResendDto {
  @IsNotEmpty()
  @IsEmail()
  @Length(3, 200)
  @Validate(EmailResendRule)
  email: string;
}
