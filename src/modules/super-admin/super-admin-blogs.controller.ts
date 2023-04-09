import { Controller, Get, Query, Put, UseGuards, HttpCode, HttpStatus, HttpException, Param } from '@nestjs/common';
import { QueryDto } from '../../common/dto/query.dto';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { BlogsQueryRepository } from '../blog-composition/modules/blogs/blogs.query-repository';
import { CommandBus } from '@nestjs/cqrs';
import { CustomErrorDto } from '../../common/dto/error';
import { BindBlogWithUserCommand } from './use-cases/bind-blog-with-user.use-case';

@Controller('sa/blogs')
export class SuperAdminBlogsController {
  constructor(private blogsQueryRepository: BlogsQueryRepository, private commandBus: CommandBus) {}

  @UseGuards(BasicAuthGuard)
  @Get('')
  async findAll(@Query() query: QueryDto) {
    return await this.blogsQueryRepository.findExtendedBlogs(query);
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':blogId/bind-with-user/:userId')
  async bindWithUser(@Param('blogId') blogId: string, @Param('userId') userId: string) {
    const result: boolean | CustomErrorDto = await this.commandBus.execute(new BindBlogWithUserCommand(userId, blogId));
    if (result instanceof CustomErrorDto) throw new HttpException(result.message, result.code);
    return;
  }
}