import { IsEmail, IsNotEmpty, IsString, Length, Validate } from 'class-validator';
import { UserExistsRule } from '../../validators/user-exists.validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 10)
  @Validate(UserExistsRule)
  login: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 20)
  password: string;

  @IsNotEmpty()
  @IsEmail()
  @Length(3, 200)
  @Validate(UserExistsRule)
  email: string;
}
