import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class RegistrationEmailResendDto {
  @IsNotEmpty()
  @IsEmail()
  @Length(3, 200)
  email: string;
}
