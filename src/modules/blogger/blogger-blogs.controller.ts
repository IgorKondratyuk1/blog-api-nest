import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpException,
  Query,
  NotFoundException,
  Put,
  HttpCode,
} from '@nestjs/common';
import { CreateBlogDto } from '../blog-composition/modules/blogs/models/input/create-blog.dto';
import { ViewBlogDto } from '../blog-composition/modules/blogs/models/output/view-blog.dto';
import { CustomErrorDto } from '../../common/dto/error';
import { QueryDto } from '../../common/dto/query.dto';
import { UpdateBlogDto } from '../blog-composition/modules/blogs/models/input/update-blog.dto';
import { BlogsService } from '../blog-composition/modules/blogs/blogs.service';
import { JwtAccessStrictAuthGuard } from '../auth/guards/jwt-access-strict-auth.guard';
import { CurrentTokenPayload } from '../auth/decorators/current-token-payload.param.decorator';
import { AuthTokenPayloadDto } from '../auth/dto/auth-token-payload.dto';
import { PostsService } from '../blog-composition/modules/posts/posts.service';
import { CommentsQueryRepository } from '../blog-composition/modules/comments/comments.query-repository';
import { CreatePostOfBlogDto } from '../blog-composition/modules/posts/models/input/create-post-of-blog.dto';
import { ViewPostDto } from '../blog-composition/modules/posts/models/output/view-post.dto';
import { UpdatePostOfBlogDto } from '../blog-composition/modules/posts/models/input/update-post-of-blog.dto';
import { BlogsQueryRepository } from '../blog-composition/modules/blogs/interfaces/blogs.query-repository';
import { PostsQueryRepository } from '../blog-composition/modules/posts/interfaces/posts.query-repository';

@Controller('blogger/blogs')
export class BloggerBlogsController {
  constructor(
    private blogsService: BlogsService,
    private postsService: PostsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @UseGuards(JwtAccessStrictAuthGuard)
  @Get()
  async findUserBlogs(@Query() query: QueryDto, @CurrentTokenPayload() tokenPayload: AuthTokenPayloadDto) {
    return await this.blogsQueryRepository.findBlogsByCreatedUserId(tokenPayload.userId, query);
  }

  @UseGuards(JwtAccessStrictAuthGuard)
  @Post('')
  async createBlog(@Body() createBlogDto: CreateBlogDto, @CurrentTokenPayload() tokenPayload: AuthTokenPayloadDto) {
    const result: ViewBlogDto | CustomErrorDto = await this.blogsService.create(tokenPayload.userId, createBlogDto);
    if (result instanceof CustomErrorDto) throw new HttpException(result.message, result.code);
    return result;
  }

  @UseGuards(JwtAccessStrictAuthGuard)
  @Put(':id')
  @HttpCode(204)
  async updateBlog(
    @Param('id') id: string,
    @CurrentTokenPayload() tokenPayload: AuthTokenPayloadDto,
    @Body() updateBlogDto: UpdateBlogDto,
  ) {
    const result: boolean | CustomErrorDto = await this.blogsService.update(tokenPayload.userId, id, updateBlogDto);
    if (result instanceof CustomErrorDto) throw new HttpException(result.message, result.code);
    if (!result) throw new NotFoundException('update error or blog is not found');
    return;
  }

  @UseGuards(JwtAccessStrictAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async removeBlog(@Param('id') id: string, @CurrentTokenPayload() tokenPayload: AuthTokenPayloadDto) {
    const result: boolean | CustomErrorDto = await this.blogsService.remove(tokenPayload.userId, id);
    if (result instanceof CustomErrorDto) throw new HttpException(result.message, result.code);
    if (!result) throw new NotFoundException('blog is not found');
    return;
  }

  @UseGuards(JwtAccessStrictAuthGuard)
  @Post(':blogId/posts')
  async createPostOfBlog(
    @Param('blogId') blogId: string,
    @CurrentTokenPayload() tokenPayload: AuthTokenPayloadDto,
    @Body() createPostOfBlogDto: CreatePostOfBlogDto,
  ) {
    const result: ViewPostDto | CustomErrorDto = await this.postsService.create(
      tokenPayload.userId,
      blogId,
      createPostOfBlogDto,
    );
    if (result instanceof CustomErrorDto) throw new HttpException(result.message, result.code);
    return result;
  }

  @UseGuards(JwtAccessStrictAuthGuard)
  @Get(':blogId/posts')
  async findUserPosts(
    @Param('blogId') blogId: string,
    @Query() query: QueryDto,
    @CurrentTokenPayload() tokenPayload: AuthTokenPayloadDto,
  ) {
    return await this.postsQueryRepository.findPostsOfBlogByUserId(blogId, query, tokenPayload.userId);
  }

  @UseGuards(JwtAccessStrictAuthGuard)
  @Put(':blogId/posts/:postId')
  @HttpCode(204)
  async updatePost(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @CurrentTokenPayload() tokenPayload: AuthTokenPayloadDto,
    @Body() updatePostOfBlogDto: UpdatePostOfBlogDto,
  ) {
    const result: boolean | CustomErrorDto = await this.postsService.updateWithBlogId(
      tokenPayload.userId,
      postId,
      blogId,
      updatePostOfBlogDto,
    );

    if (result instanceof CustomErrorDto) throw new HttpException(result.message, result.code);
    if (!result) throw new NotFoundException();
    return;
  }

  @UseGuards(JwtAccessStrictAuthGuard)
  @Delete(':blogId/posts/:postId')
  @HttpCode(204)
  async removePost(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @CurrentTokenPayload() tokenPayload: AuthTokenPayloadDto,
  ) {
    const result: boolean | CustomErrorDto = await this.postsService.removeWithBlogId(
      tokenPayload.userId,
      postId,
      blogId,
    );

    if (result instanceof CustomErrorDto) throw new HttpException(result.message, result.code);
    if (!result) throw new NotFoundException();
    return;
  }

  @UseGuards(JwtAccessStrictAuthGuard)
  @Get('comments')
  async findCommentsOfUserBlog(@Query() query: QueryDto, @CurrentTokenPayload() tokenPayload: AuthTokenPayloadDto) {
    return await this.commentsQueryRepository.findAllCommentsOfUserBlogs(tokenPayload.userId, query);
  }
}
