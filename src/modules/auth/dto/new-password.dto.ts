import { IsNotEmpty, IsString } from 'class-validator';

export class NewPasswordDto {
  @IsNotEmpty()
  @IsString()
  newPassword: string;

  @IsNotEmpty()
  @IsString()
  recoveryCode: string;
}
