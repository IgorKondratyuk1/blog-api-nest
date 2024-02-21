import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../users/interfaces/users.repository';
import UserEntity from '../../users/entities/user.entity';

@ValidatorConstraint({ name: 'EmailResend', async: true })
@Injectable()
export class EmailResendRule implements ValidatorConstraintInterface {
  constructor(private usersRepository: UsersRepository) {}

  async validate(value: string) {
    try {
      const user: UserEntity | null = await this.usersRepository.findUserByLoginOrEmail(value);
      if (!user) return false;
      if (user.emailConfirmation.isConfirmed) return false;
    } catch (e) {
      console.log(e);
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `User with email: "${args.value}" is not exist or already confirmed`;
  }
}
