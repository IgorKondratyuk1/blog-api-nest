import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';
import { UserExistsRule } from '../../../common/validators/user-exists.validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(10)
  @Validate(UserExistsRule)
  login: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string;

  @IsNotEmpty()
  @IsEmail()
  @MinLength(3)
  @MaxLength(200)
  @Validate(UserExistsRule)
  email: string;
}
