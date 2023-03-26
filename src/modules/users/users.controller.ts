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
  ValidationPipe,
  UsePipes,
  HttpException,
  UseGuards,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersQueryRepository } from './users.query-repository';
import { QueryUserDto } from './dto/query-user.dto';
import ViewUserDto from './dto/view-user.dto';
import { CustomErrorDto } from '../../common/dto/error';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const result: ViewUserDto | null = await this.usersService.create(createUserDto);
    if (!result) throw new InternalServerErrorException('can not create user');
    return result;
  }

  @UseGuards(BasicAuthGuard)
  @Get()
  findAll(@Query() query: QueryUserDto) {
    return this.usersQueryRepository.findAll(query);
  }

  @UseGuards(BasicAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user: ViewUserDto | null = await this.usersQueryRepository.findOne(id);
    if (!user) throw new NotFoundException('user not found');
    return user;
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    const result: boolean = await this.usersService.remove(id);
    if (!result) throw new NotFoundException('User not found');
    return;
  }
}
