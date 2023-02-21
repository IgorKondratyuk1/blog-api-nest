import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryType } from '../../common/types/pagination';
import { UsersQueryRepository } from './users.query-repository';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@Query() query: QueryType) {
    return this.usersQueryRepository.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersQueryRepository.findOne(id);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    const result = await this.usersService.remove(id);
    if (!result) throw new NotFoundException('User is not found');
    return;
  }
}
