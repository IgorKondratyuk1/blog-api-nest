import { Controller, Get, Param, Query, NotFoundException, UseGuards } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { PostsService } from '../posts/posts.service';
import { QueryDto } from '../../../../common/dto/query.dto';
import { JwtAccessSoftAuthGuard } from '../../../auth/guards/jwt-access-soft-auth.guard';
import { CurrentUserId } from '../../../auth/decorators/current-user-id.param.decorator';
import { SkipThrottle } from '@nestjs/throttler';
import { BlogsQueryRepository } from './interfaces/blogs.query-repository';
import { PostsQueryRepository } from '../posts/interfaces/posts.query-repository';

@SkipThrottle()
@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
    private postsService: PostsService,
  ) {}

  // @UseGuards(BasicAuthGuard)
  // @Post()
  // async create(@Body() createBlogDto: CreateBlogDto) {
  //   const result: ViewBlogDto | CustomErrorDto = await this.blogsService.create(createBlogDto);
  //   if (result instanceof CustomErrorDto) throw new HttpException(result.message, result.code);
  //   return result;
  // }

  // @UseGuards(BasicAuthGuard)
  // @Post(':id/posts')
  // async createPostOfBlog(@Param('id') id: string, @Body() createPostOfBlogDto: CreatePostOfBlogDto) {
  //   const result: ViewPostDto | CustomErrorDto = await this.postsService.create(createPostOfBlogDto, id);
  //   if (result instanceof CustomErrorDto) throw new HttpException(result.message, result.code);
  //   return result;
  // }

  // @UseGuards(BasicAuthGuard)
  // @Put(':id')
  // @HttpCode(204)
  // async update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
  //   const result: boolean = await this.blogsService.update(id, updateBlogDto);
  //   if (!result) throw new NotFoundException('update error or blog is not found');
  //   return;
  // }

  // @UseGuards(BasicAuthGuard)
  // @Delete(':id')
  // @HttpCode(204)
  // async remove(@Param('id') id: string) {
  //   const result = await this.blogsService.remove(id);
  //   if (!result) throw new NotFoundException('blog is not found');
  //   return;
  // }

  @Get()
  findAll(@Query() query: QueryDto) {
    return this.blogsQueryRepository.findAll(query, true);
  }

  @UseGuards(JwtAccessSoftAuthGuard)
  @Get(':id/posts')
  async findAllPostsOfBlog(@Param('id') id: string, @Query() query: QueryDto, @CurrentUserId() userId: string) {
    const blog = await this.blogsService.findById(id);
    if (!blog) throw new NotFoundException('blog is not found');

    return await this.postsQueryRepository.findPostsOfBlog(id, query, userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const blog = await this.blogsQueryRepository.findOne(id);
    if (!blog) throw new NotFoundException();
    return blog;
  }
}
