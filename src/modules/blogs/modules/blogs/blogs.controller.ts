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
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogsQueryRepository } from './blogs.query-repository';
import { QueryType } from '../../../../common/types/pagination';
import { CreatePostDto } from '../posts/dto/create-post.dto';
import { PostsService } from '../posts/posts.service';
import { PostsQueryRepository } from '../posts/posts.query-repository';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
    private postsService: PostsService,
  ) {}

  @Post()
  async create(@Body() createBlogDto: CreateBlogDto) {
    return await this.blogsService.create(createBlogDto);
  }

  @Post(':id/posts')
  async createPostOfBlog(@Param('id') id: string, @Body() createPostDto: CreatePostDto) {
    return await this.postsService.create(createPostDto, id);
  }

  @Get()
  findAll(@Query() query: QueryType) {
    return this.blogsQueryRepository.findBlogs(query);
  }

  @Get(':id/posts')
  async findAllPostsOfBlog(@Param('id') id: string, @Query() query: QueryType) {
    const blog = await this.blogsService.findOne(id);
    if (!blog) throw new NotFoundException('Blog is not found');

    return await this.postsQueryRepository.findPostsOfBlog(id, query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.blogsQueryRepository.findOne(id);
  }

  @Put(':id')
  @HttpCode(204)
  async update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return await this.blogsService.update(id, updateBlogDto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    const result = await this.blogsService.remove(id);
    if (!result) throw new NotFoundException('Blog is not found');
    return;
  }
}
