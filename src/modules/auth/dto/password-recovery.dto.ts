import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class PasswordRecoveryDto {
  @IsNotEmpty()
  @IsEmail()
  @Length(3, 200)
  email: string;
}
