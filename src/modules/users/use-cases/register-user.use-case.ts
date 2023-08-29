import { HttpStatus } from '@nestjs/common';
import { CreateUserDto } from '../dto/input/create-user.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CustomErrorDto } from '../../../common/dto/error';
import { EmailManagerService } from '../../email/email-manager.service';
import UserModel from '../models/user.model';
import { UsersRepository } from '../interfaces/users.repository';

export class RegisterUserCommand {
  constructor(public createUserDto: CreateUserDto) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase implements ICommandHandler<RegisterUserCommand> {
  constructor(private usersRepository: UsersRepository, private emailManagerService: EmailManagerService) {}

  async execute(command: RegisterUserCommand): Promise<UserModel | CustomErrorDto> {
    // 1. Create new user
    const newUser: UserModel = await UserModel.createInstance(command.createUserDto);
    const createdUser: UserModel | null = await this.usersRepository.create(newUser);
    if (!createdUser) return new CustomErrorDto(HttpStatus.NOT_FOUND, 'user not found');

    // 2. Try to send password confirmation email
    const result = await this.sendEmailConfirmation(createdUser);

    if (result) {
      return createdUser;
    } else {
      // 2.1. If occurred Error, then delete user
      await this.usersRepository.remove(createdUser.id);
      return new CustomErrorDto(HttpStatus.SERVICE_UNAVAILABLE, 'error occurred while try to send email');
    }
  }

  private async sendEmailConfirmation(createdUser: UserModel): Promise<boolean> {
    try {
      await this.emailManagerService.sendEmailConfirmationMessage(createdUser);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
