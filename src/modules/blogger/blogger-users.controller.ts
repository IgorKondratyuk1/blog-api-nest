import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  NotFoundException,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAccessStrictAuthGuard } from '../auth/guards/jwt-access-strict-auth.guard';
import { CurrentTokenPayload } from '../auth/decorators/current-token-payload.param.decorator';
import { AuthTokenPayloadDto } from '../auth/dto/auth-token-payload.dto';
import { CustomErrorDto } from '../../common/dto/error';
import { CreateBanByBloggerDto } from '../ban/dto/input/create-ban-by-blogger.dto';
import { BanService } from '../ban/ban.service';
import { BanQueryRepository } from '../ban/ban.query-repository';
import { QueryBannedUserDto } from '../users/dto/query-banned-user.dto';
import { BanUserByBloggerCommand } from '../users/use-cases/ban-user-by-blogger.use-case';
import { CommandBus } from '@nestjs/cqrs';

@Controller('blogger/users')
export class BloggerUsersController {
  constructor(
    private banService: BanService,
    private banQueryRepository: BanQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(JwtAccessStrictAuthGuard)
  @Put('/:userId/ban')
  @HttpCode(204)
  async banUser(
    @Param('userId') userId: string,
    @CurrentTokenPayload() tokenPayload: AuthTokenPayloadDto,
    @Body() createBanByBloggerDto: CreateBanByBloggerDto,
  ) {
    const result: boolean | CustomErrorDto = await this.commandBus.execute(
      new BanUserByBloggerCommand(tokenPayload.userId, userId, createBanByBloggerDto),
    );

    if (result instanceof CustomErrorDto) throw new HttpException(result.message, result.code);
    if (!result) throw new NotFoundException();
    return;
  }

  @UseGuards(JwtAccessStrictAuthGuard)
  @Get('blog/:blogId')
  async getBannedForBlogUsers(
    @Param('blogId') blogId: string,
    @Query() query: QueryBannedUserDto,
    @CurrentTokenPayload() tokenPayload: AuthTokenPayloadDto,
  ) {
    return await this.banQueryRepository.findBannedUsersForBlog(blogId, query);
  }
}
