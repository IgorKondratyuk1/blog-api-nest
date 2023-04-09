import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  InternalServerErrorException,
  Query,
  NotFoundException,
  HttpCode,
  Put,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UsersQueryRepository } from '../users/users.query-repository';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import ViewUserDto from '../users/dto/view-user.dto';
import { QueryUserDto } from '../users/dto/query-user.dto';
import { BanUserDto } from '../users/dto/ban-user.dto';
import { CommandBus } from '@nestjs/cqrs';
import { BanUserCommand } from '../auth/use-cases/ban-user.use-case';

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
    const result: ViewUserDto | null = await this.commandBus.execute(new BanUserCommand(userId, banUserDto));
    if (!result) throw new InternalServerErrorException('');
    return;
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const result: ViewUserDto | null = await this.usersService.create(createUserDto, true);
    if (!result) throw new InternalServerErrorException('can not create user');
    return result;
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
