import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
  HttpCode,
  NotFoundException,
  UseGuards,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsQueryRepository } from './posts.query-repository';
import { CommentsQueryRepository } from '../comments/comments.query-repository';
import { ViewCommentDto } from '../comments/dto/view-comment.dto';
import { QueryDto } from '../../../../common/dto/query.dto';
import { PaginationDto } from '../../../../common/dto/pagination';
import { JwtAccessStrictAuthGuard } from '../../../auth/guards/jwt-access-strict-auth.guard';
import { CurrentTokenPayload } from '../../../auth/decorators/current-token-payload.param.decorator';
import { AuthTokenPayloadDto } from '../../../auth/dto/auth-token-payload.dto';
import { BasicAuthGuard } from '../../../auth/guards/basic-auth.guard';
import { UpdateLikeDto } from '../likes/dto/update-like.dto';
import { CommentsService } from '../comments/comments.service';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';
import { CommentDocument } from '../comments/schemas/comment.schema';
import { CustomErrorDto } from '../../../../common/dto/error';
import { JwtAccessSoftAuthGuard } from '../../../auth/guards/jwt-access-soft-auth.guard';
import { CurrentUserId } from '../../../auth/decorators/current-user-id.param.decorator';
import { ViewPostDto } from './dto/view-post.dto';
import { PostDocument } from './schemas/post.schema';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
    private commentsService: CommentsService,
  ) {}

  // @UseGuards(BasicAuthGuard)
  // @Post()
  // async create(@Body() createPostDto: CreatePostDto) {
  //   const result: ViewPostDto | CustomErrorDto = await this.postsService.create(
  //     createPostDto,
  //     createPostDto.blogId,
  //   );
  //   if (result instanceof CustomErrorDto) throw new HttpException(result.message, result.code);
  //   return result;
  // }

  // @UseGuards(BasicAuthGuard)
  // @Put(':id')
  // @HttpCode(204)
  // async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
  //   const result: boolean = await this.postsService.update(id, updatePostDto);
  //   if (!result) throw new NotFoundException();
  //   return;
  // }

  // @UseGuards(BasicAuthGuard)
  // @Delete(':id')
  // @HttpCode(204)
  // async remove(@Param('id') id: string) {
  //   const result: boolean = await this.postsService.remove(id);
  //   if (!result) throw new NotFoundException();
  //   return;
  // }

  @UseGuards(JwtAccessSoftAuthGuard)
  @Get()
  async findAll(@Query() query: QueryDto, @CurrentUserId() userId: string) {
    return await this.postsQueryRepository.findAll(query, userId);
  }

  @UseGuards(JwtAccessSoftAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUserId() userId: string) {
    const post = await this.postsQueryRepository.findById(id, userId);
    if (!post) throw new NotFoundException();
    return post;
  }

  @UseGuards(JwtAccessStrictAuthGuard)
  @Post(':id/comments')
  async createCommentOfPost(
    @Param('id') id: string,
    @CurrentTokenPayload() tokenPayload: AuthTokenPayloadDto,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const result: ViewCommentDto | CustomErrorDto = await this.commentsService.create(
      createCommentDto,
      id,
      tokenPayload.userId,
    );
    if (result instanceof CustomErrorDto) throw new HttpException(result.message, result.code);
    return result;
  }

  @UseGuards(JwtAccessSoftAuthGuard)
  @Get(':id/comments')
  async findCommentsOfPost(
    @Param('id') id: string,
    @Query() query: QueryDto,
    @CurrentUserId() userId: string,
  ): Promise<PaginationDto<ViewCommentDto>> {
    const post: PostDocument | null = await this.postsService.findOne(id);
    if (!post) throw new NotFoundException('post not found');
    return await this.commentsQueryRepository.findCommentsOfPost(id, query, userId);
  }

  @UseGuards(JwtAccessStrictAuthGuard)
  @Put(':id/like-status')
  @HttpCode(204)
  async updateLikeStatus(
    @Param('id') id: string,
    @CurrentTokenPayload() tokenPayload: AuthTokenPayloadDto,
    @Body() updateLikeDto: UpdateLikeDto,
  ) {
    const result: boolean | CustomErrorDto = await this.postsService.updateLikeStatus(
      id,
      tokenPayload.userId,
      tokenPayload.userLogin,
      updateLikeDto.likeStatus,
    );

    if (result instanceof CustomErrorDto) throw new HttpException(result.message, result.code);
    if (!result) throw new InternalServerErrorException('can not update comment');
    return;
  }
}