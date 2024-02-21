import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './models/input/create-user.dto';
import { BanUserDto } from '../ban/dto/input/ban-user.dto';
import { UsersRepository } from './interfaces/users.repository';
import { UserNotCreatedError } from './errors/user-not-created.error';
import { UserNotFoundError } from './errors/user-not-found.error';
import UserEntity from './entities/user.entity';

// TODO Question: Make use-cases for some difficult/business operations. Find, Create, Delete - keep in service
@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto, isConfirmed = false): Promise<UserEntity> | never {
    const user: UserEntity = await UserEntity.createInstance(createUserDto, isConfirmed);
    const createdUser: UserEntity | null = await this.usersRepository.create(user);
    if (!createdUser) throw new UserNotCreatedError('user not created');

    return createdUser;
  }

  async findById(id: string): Promise<UserEntity | null> {
    return await this.usersRepository.findById(id);
  }

  async remove(id: string): Promise<boolean> {
    return await this.usersRepository.remove(id);
  }

  async setUserBanStatus(userId: string, banUserDto: BanUserDto): Promise<boolean> | never {
    const user: UserEntity | null = await this.usersRepository.findById(userId);
    if (!user) throw new UserNotFoundError('user not found');

    user.setIsBanned(banUserDto.isBanned, banUserDto.banReason);
    await this.usersRepository.save(user);
    return true;
  }
}
