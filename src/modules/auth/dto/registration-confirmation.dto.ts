import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { CodeResendRule } from '../validators/resend-code.validator';

export class RegistrationConfirmationDto {
  @IsNotEmpty()
  @IsString()
  @Validate(CodeResendRule)
  code: string;
}
