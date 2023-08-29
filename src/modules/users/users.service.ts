import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/input/create-user.dto';
import { UsersMapper } from './utils/users.mapper';
import ViewUserDto from './dto/output/view-user.dto';
import { CustomErrorDto } from '../../common/dto/error';
import { BanUserDto } from '../ban/dto/input/ban-user.dto';
import UserModel from './models/user.model';
import { UsersRepository } from './interfaces/users.repository';

// TODO Question: Make use-cases for some difficult/business operations. Find, Create, Delete - keep in service
@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto, isConfirmed = false): Promise<ViewUserDto | null> {
    const user: UserModel = await UserModel.createInstance(createUserDto, isConfirmed);
    const createdUser: UserModel | null = await this.usersRepository.create(user);
    if (!createdUser) return null;

    return UsersMapper.toView(createdUser);
  }

  async findById(id: string): Promise<UserModel | null> {
    const user: UserModel | null = await this.usersRepository.findById(id);
    return user;
  }

  async remove(id: string): Promise<boolean> {
    return await this.usersRepository.remove(id);
  }

  async setUserBanStatus(userId: string, banUserDto: BanUserDto): Promise<boolean | CustomErrorDto> {
    const user: UserModel | null = await this.usersRepository.findById(userId);
    if (!user) return new CustomErrorDto(HttpStatus.NOT_FOUND, 'user not found');

    user.setIsBanned(banUserDto.isBanned, banUserDto.banReason);
    await this.usersRepository.save(user);
    return true;
  }
}
