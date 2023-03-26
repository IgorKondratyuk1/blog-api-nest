import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpCode,
  Query,
  NotFoundException,
  UseGuards,
  HttpException,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { BlogsQueryRepository } from './blogs.query-repository';
import { CreatePostDto } from '../posts/dto/create-post.dto';
import { PostsService } from '../posts/posts.service';
import { PostsQueryRepository } from '../posts/posts.query-repository';
import { QueryDto } from '../../../../common/dto/query.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BasicAuthGuard } from '../../../auth/guards/basic-auth.guard';
import { JwtAccessSoftAuthGuard } from '../../../auth/guards/jwt-access-soft-auth.guard';
import { CurrentUserId } from '../../../auth/decorators/current-user-id.param.decorator';
import { CustomErrorDto } from '../../../../common/dto/error';
import { PostDocument } from '../posts/schemas/post.schema';
import { ViewPostDto } from '../posts/dto/view-post.dto';
import { ViewBlogDto } from './dto/view-blog.dto';
import { CreatePostOfBlogModel } from '../../../../../test/models/post/createPostOfBlog';
import { CreatePostOfBlogDto } from '../posts/dto/create-post-of-blog.dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
    private postsService: PostsService,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Post()
  async create(@Body() createBlogDto: CreateBlogDto) {
    const result: ViewBlogDto | CustomErrorDto = await this.blogsService.create(createBlogDto);
    if (result instanceof CustomErrorDto) throw new HttpException(result.message, result.code);
    return result;
  }

  @UseGuards(BasicAuthGuard)
  @Post(':id/posts')
  async createPostOfBlog(
    @Param('id') id: string,
    @Body() createPostOfBlogDto: CreatePostOfBlogDto,
  ) {
    const result: ViewPostDto | CustomErrorDto = await this.postsService.create(
      createPostOfBlogDto,
      id,
    );
    if (result instanceof CustomErrorDto) throw new HttpException(result.message, result.code);
    return result;
  }

  @Get()
  findAll(@Query() query: QueryDto) {
    return this.blogsQueryRepository.findBlogs(query);
  }

  @UseGuards(JwtAccessSoftAuthGuard)
  @Get(':id/posts')
  async findAllPostsOfBlog(
    @Param('id') id: string,
    @Query() query: QueryDto,
    @CurrentUserId() userId: string,
  ) {
    const blog = await this.blogsService.findOne(id);
    if (!blog) throw new NotFoundException('blog is not found');

    return await this.postsQueryRepository.findPostsOfBlog(id, query, userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const blog = await this.blogsQueryRepository.findOne(id);
    if (!blog) throw new NotFoundException();
    return blog;
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(204)
  async update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    const result: boolean = await this.blogsService.update(id, updateBlogDto);
    if (!result) throw new NotFoundException('update error or blog is not found');
    return;
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    const result = await this.blogsService.remove(id);
    if (!result) throw new NotFoundException('blog is not found');
    return;
  }
}
