import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import { UsersMapper } from './utils/users.mapper';
import { UserDocument } from './schemas/user.schema';
import ViewUserDto from './dto/view-user.dto';
import { CustomErrorDto } from '../../common/dto/error';
import { BanUserDto } from './dto/ban-user.dto';

// TODO Question: Make use-cases for some difficult/business operations. Find, Create, Delete - keep in service
@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto, isConfirmed = false): Promise<ViewUserDto | null> {
    const createdUser: UserDocument | null = await this.usersRepository.create(createUserDto, isConfirmed);
    if (!createdUser) return null;
    return UsersMapper.toView(createdUser);
  }

  async findById(id: string): Promise<UserDocument | null> {
    const user: UserDocument | null = await this.usersRepository.findById(id);
    return user;
  }

  async remove(id: string): Promise<boolean> {
    return await this.usersRepository.remove(id);
  }

  async setUserBanStatus(userId: string, banUserDto: BanUserDto): Promise<boolean | CustomErrorDto> {
    const user: UserDocument | null = await this.usersRepository.findById(userId);
    if (!user) return new CustomErrorDto(HttpStatus.NOT_FOUND, 'user not found');

    user.setIsBanned(banUserDto.isBanned, banUserDto.banReason);
    await this.usersRepository.save(user);
    return true;
  }
}
