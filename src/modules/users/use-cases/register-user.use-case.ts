import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserDocument } from '../schemas/user.schema';
import { CustomErrorDto } from '../../../common/dto/error';
import { UsersRepository } from '../users.repository';
import { EmailManagerService } from '../../email/email-manager.service';

export class RegisterUserCommand {
  constructor(public createUserDto: CreateUserDto) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase implements ICommandHandler<RegisterUserCommand> {
  constructor(private usersRepository: UsersRepository, private emailManagerService: EmailManagerService) {}

  async execute(command: RegisterUserCommand): Promise<UserDocument | CustomErrorDto> {
    // 1. Create new user
    const createdUser: UserDocument | null = await this.usersRepository.create(command.createUserDto);
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

  private async sendEmailConfirmation(createdUser: UserDocument): Promise<boolean> {
    try {
      await this.emailManagerService.sendEmailConfirmationMessage(createdUser);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
