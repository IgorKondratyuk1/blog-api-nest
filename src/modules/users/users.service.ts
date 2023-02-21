import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto, isConfirmed = false) {
    const createdUser = await this.usersRepository.create(createUserDto, isConfirmed);
    return createdUser;
  }

  async findOne(id: string) {
    return await this.usersRepository.findOne(id);
  }

  async remove(id: string) {
    return await this.usersRepository.remove(id);
  }
}
