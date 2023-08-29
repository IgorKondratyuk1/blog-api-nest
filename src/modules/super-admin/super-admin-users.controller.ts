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
  Inject,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { CreateUserDto } from '../users/dto/input/create-user.dto';
import ViewUserDto from '../users/dto/output/view-user.dto';
import { QueryUserDto } from '../users/dto/input/query-user.dto';
import { BanUserDto } from '../ban/dto/input/ban-user.dto';
import { CommandBus } from '@nestjs/cqrs';
import { BanUserBySaCommand } from '../users/use-cases/ban-user-by-sa.use-case';
import { UsersQueryRepository } from '../users/interfaces/users.query-repository';

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
    const result: ViewUserDto | null = await this.commandBus.execute(new BanUserBySaCommand(userId, banUserDto));
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
