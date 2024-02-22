import {
  Controller,
  Get,
  Query,
  Put,
  UseGuards,
  HttpCode,
  HttpStatus,
  HttpException,
  Param,
  InternalServerErrorException,
  Body,
  Post,
  NotFoundException,
  Delete,
} from '@nestjs/common';
import { QueryDto } from '../../common/dto/query.dto';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CustomErrorDto } from '../../common/dto/error';
import { BanBlogDto } from '../blog-composition/modules/blogs/models/input/ban-blog.dto';
import { BanBlogCommand } from '../blog-composition/modules/blogs/use-cases/ban-blog.use-case';
import { BindBlogWithUserCommand } from '../blog-composition/modules/blogs/use-cases/bind-blog-with-user.use-case';
import { BlogsQueryRepository } from '../blog-composition/modules/blogs/interfaces/blogs.query-repository';
import { CreateBlogDto } from '../blog-composition/modules/blogs/models/input/create-blog.dto';
import { ViewBlogDto } from '../blog-composition/modules/blogs/models/output/view-blog.dto';
import { BlogsService } from '../blog-composition/modules/blogs/blogs.service';
import { PostsService } from '../blog-composition/modules/posts/posts.service';
import { PostsQueryRepository } from '../blog-composition/modules/posts/interfaces/posts.query-repository';
import { UpdateBlogDto } from '../blog-composition/modules/blogs/models/input/update-blog.dto';
import { CreatePostOfBlogDto } from '../blog-composition/modules/posts/models/input/create-post-of-blog.dto';
import { ViewPostDto } from '../blog-composition/modules/posts/models/output/view-post.dto';
import { UpdatePostOfBlogDto } from '../blog-composition/modules/posts/models/input/update-post-of-blog.dto';

@Controller('sa/blogs')
export class SuperAdminBlogsController {
  constructor(
    private blogsService: BlogsService,
    private postsService: PostsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get('')
  async findAll(@Query() query: QueryDto) {
    //return await this.blogsQueryRepository.findBlogsWithExtendedInfo(query);
    return await this.blogsQueryRepository.findAll(query, false);
  }

  @UseGuards(BasicAuthGuard)
  @Post('')
  async createBlog(@Body() createBlogDto: CreateBlogDto) {
    const result: ViewBlogDto | CustomErrorDto = await this.blogsService.create(null, createBlogDto);
    if (result instanceof CustomErrorDto) throw new HttpException(result.message, result.code);
    return result;
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(204)
  async updateBlog(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    const result: boolean | CustomErrorDto = await this.blogsService.update(null, id, updateBlogDto);
    if (result instanceof CustomErrorDto) throw new HttpException(result.message, result.code);
    if (!result) throw new NotFoundException('update error or blog is not found');
    return;
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async removeBlog(@Param('id') id: string) {
    const result: boolean | CustomErrorDto = await this.blogsService.removeByAdmin(id);
    if (result instanceof CustomErrorDto) throw new HttpException(result.message, result.code);
    if (!result) throw new NotFoundException();
    return;
  }

  @UseGuards(BasicAuthGuard)
  @Post(':blogId/posts')
  async createPostOfBlog(@Param('blogId') blogId: string, @Body() createPostOfBlogDto: CreatePostOfBlogDto) {
    const result: ViewPostDto | CustomErrorDto = await this.postsService.createByAdmin(blogId, createPostOfBlogDto);
    if (result instanceof CustomErrorDto) throw new HttpException(result.message, result.code);
    return result;
  }

  @UseGuards(BasicAuthGuard)
  @Get(':blogId/posts')
  async findUserPosts(@Param('blogId') blogId: string, @Query() query: QueryDto) {
    return await this.postsQueryRepository.findPostsOfBlog(blogId, query);
  }

  @UseGuards(BasicAuthGuard)
  @Put(':blogId/posts/:postId')
  @HttpCode(204)
  async updatePost(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() updatePostOfBlogDto: UpdatePostOfBlogDto,
  ) {
    const result: boolean | CustomErrorDto = await this.postsService.updateWithBlogIdByAdmin(
      postId,
      blogId,
      updatePostOfBlogDto,
    );

    if (result instanceof CustomErrorDto) throw new HttpException(result.message, result.code);
    if (!result) throw new NotFoundException();
    return;
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':blogId/posts/:postId')
  @HttpCode(204)
  async removePost(@Param('blogId') blogId: string, @Param('postId') postId: string) {
    const result: boolean | CustomErrorDto = await this.postsService.removeWithBlogIdByAdmin(postId, blogId);

    if (result instanceof CustomErrorDto) throw new HttpException(result.message, result.code);
    if (!result) throw new NotFoundException();
    return;
  }

  @UseGuards(BasicAuthGuard)
  @Put(':blogId/bind-with-user/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async bindWithUser(@Param('blogId') blogId: string, @Param('userId') userId: string) {
    const result: boolean | CustomErrorDto = await this.commandBus.execute(new BindBlogWithUserCommand(userId, blogId));
    if (result instanceof CustomErrorDto) throw new HttpException(result.message, result.code);
    if (!result) throw new InternalServerErrorException('can not update blog');
    return;
  }

  @UseGuards(BasicAuthGuard)
  @Put(':blogId/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  async banUser(@Param('blogId') blogId: string, @Body() banBlogDto: BanBlogDto) {
    const result: boolean | CustomErrorDto = await this.commandBus.execute(new BanBlogCommand(blogId, banBlogDto));
    if (result instanceof CustomErrorDto) throw new HttpException(result.message, result.code);
    if (!result) throw new InternalServerErrorException('can not ban blog');
    return;
  }
}
