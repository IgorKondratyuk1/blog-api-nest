import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import { UsersMapper } from './utils/users.mapper';
import { User, UserDocument } from './schemas/user.schema';
import ViewUserDto from './dto/view-user.dto';
import { CustomErrorDto } from '../../common/dto/error';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto, isConfirmed = false): Promise<ViewUserDto | null> {
    const createdUser: UserDocument | null = await this.usersRepository.create(
      createUserDto,
      isConfirmed,
    );
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
}
