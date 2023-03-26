import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../users/users.repository';
import { UserDocument } from '../../users/schemas/user.schema';

@ValidatorConstraint({ name: 'CodeResend', async: true })
@Injectable()
export class CodeResendRule implements ValidatorConstraintInterface {
  constructor(private usersRepository: UsersRepository) {}

  async validate(value: string) {
    try {
      const user: UserDocument | null = await this.usersRepository.findUserByEmailConfirmationCode(
        value,
      );
      if (!user) return false;
      if (user.emailConfirmation.isConfirmed) return false;
    } catch (e) {
      console.log(e);
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `Code: "${args.value}" is not exist or already used`;
  }
}
