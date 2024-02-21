import { HttpStatus } from '@nestjs/common';
import { CreateUserDto } from '../../users/models/input/create-user.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CustomErrorDto } from '../../../common/dto/error';
import { EmailManagerService } from '../../email/email-manager.service';
import { UsersRepository } from '../../users/interfaces/users.repository';
import UserEntity from '../../users/entities/user.entity';

export class RegisterUserCommand {
  constructor(public createUserDto: CreateUserDto) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase implements ICommandHandler<RegisterUserCommand> {
  constructor(private usersRepository: UsersRepository, private emailManagerService: EmailManagerService) {}

  async execute(command: RegisterUserCommand): Promise<UserEntity | CustomErrorDto> {
    // 1. Create new user
    const newUser: UserEntity = await UserEntity.createInstance(command.createUserDto);
    const createdUser: UserEntity | null = await this.usersRepository.create(newUser);
    if (!createdUser) return new CustomErrorDto(HttpStatus.NOT_FOUND, 'user not found');

    // 2. Try to send password confirmation email
    const result = await this.sendEmailConfirmation(createdUser);

    if (result) {
      return createdUser;
    } else {
      // 2.1. If Error occurred, then delete user
      await this.usersRepository.remove(createdUser.id);
      return new CustomErrorDto(HttpStatus.SERVICE_UNAVAILABLE, 'error occurred while try to send email');
    }
  }

  private async sendEmailConfirmation(createdUser: UserEntity): Promise<boolean> {
    try {
      await this.emailManagerService.sendEmailConfirmationMessage(createdUser);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
