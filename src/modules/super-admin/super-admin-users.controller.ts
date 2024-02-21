import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  NotFoundException,
  HttpCode,
  Put,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { CreateUserDto } from '../users/models/input/create-user.dto';
import { QueryUserDto } from '../users/models/input/query-user.dto';
import { BanUserDto } from '../ban/dto/input/ban-user.dto';
import { CommandBus } from '@nestjs/cqrs';
import { BanUserBySaCommand } from '../users/use-cases/ban-user-by-sa.use-case';
import { UsersQueryRepository } from '../users/interfaces/users.query-repository';
import UserEntity from '../users/entities/user.entity';
import { UsersMapper } from '../users/utils/users.mapper';
import { UserNotCreatedError } from '../users/errors/user-not-created.error';

@Controller('sa/users')
export class SuperAdminUsersController {
  constructor(
    private usersService: UsersService,
    private usersQueryRepository: UsersQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Put(':userId/ban')
  @HttpCode(204)
  async banUser(@Param('userId') userId: string, @Body() banUserDto: BanUserDto) {
    try {
      await this.commandBus.execute(new BanUserBySaCommand(userId, banUserDto));
      return;
    } catch (e) {
      console.log(e);
    }
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const createdUser: UserEntity = await this.usersService.create(createUserDto, true);
      return UsersMapper.toView(createdUser);
    } catch (e) {
      console.log(e);
      if (e instanceof UserNotCreatedError) {
        throw new BadRequestException(e.message);
      } else {
        throw new BadRequestException('Error Occurred');
      }
    }
  }

  @UseGuards(BasicAuthGuard)
  @Get()
  findAll(@Query() query: QueryUserDto) {
    return this.usersQueryRepository.findAll(query);
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':userId')
  @HttpCode(204)
  async remove(@Param('userId') userId: string) {
    const result: boolean = await this.usersService.remove(userId);
    if (!result) throw new NotFoundException('user not found');
    return;
  }
}
