import { IsNotEmpty, IsString } from 'class-validator';

export class RegistrationConfirmationDto {
  @IsNotEmpty()
  @IsString()
  code: string;
}
