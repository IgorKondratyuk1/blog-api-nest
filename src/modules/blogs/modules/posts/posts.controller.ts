import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsQueryRepository } from './posts.query-repository';
import { Paginator, QueryType } from '../../../../common/types/pagination';
import { CommentsQueryRepository } from '../comments/comments.query-repository';
import { ViewCommentDto } from '../comments/dto/view-comment.dto';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}

  // TODO async await in NestJS controllers
  @Post()
  async create(@Body() createPostDto: CreatePostDto) {
    return await this.postsService.create(createPostDto, createPostDto.blogId);
  }

  @Get()
  async findAll(@Query() query: QueryType) {
    return await this.postsQueryRepository.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.postsQueryRepository.findOne(id);
  }

  @Get(':id/comments')
  async findCommentsOfPost(
    @Param('id') id: string,
    @Query() query: QueryType,
  ): Promise<Paginator<ViewCommentDto>> {
    return await this.commentsQueryRepository.findCommentsOfPost(id, query);
  }

  @Put(':id')
  @HttpCode(204)
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return await this.postsService.update(id, updatePostDto);
  }

  // TODO Question: HttpCode - return only code. How to return other code and data.
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    const result = await this.postsService.remove(id);
    if (!result) throw new NotFoundException('Post is not found');
    return;
  }
}
