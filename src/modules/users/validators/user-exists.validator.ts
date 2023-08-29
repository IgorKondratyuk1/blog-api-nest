import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../interfaces/users.repository';

@ValidatorConstraint({ name: 'UserExists', async: true })
@Injectable()
export class UserExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly usersRepository: UsersRepository) {}

  async validate(value: string) {
    try {
      const user = await this.usersRepository.findUserByLoginOrEmail(value);
      if (!user) return true;
    } catch (e) {
      console.log(e);
    }

    return false;
  }

  defaultMessage(args: ValidationArguments) {
    return `User with login or email: "${args.value}" is already exist`;
  }
}
