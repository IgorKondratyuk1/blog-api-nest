import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsRepository } from './posts.repository';
import { BlogDocument } from '../blogs/schemas/blog.schema';
import { BlogsRepository } from '../blogs/blogs.repository';
import { PostsMapper } from './utils/posts.mapper';
import { ViewPostDto } from './dto/view-post.dto';
import { CustomErrorDto } from '../../../../common/dto/error';
import { LikeLocation, LikeStatusType } from '../likes/types/like';
import { CommentDocument } from '../comments/schemas/comment.schema';
import { LikesService } from '../likes/likes.service';
import { PostDocument } from './schemas/post.schema';
import { CreatePostOfBlogDto } from './dto/create-post-of-blog.dto';

@Injectable()
export class PostsService {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
    private likesService: LikesService,
  ) {}

  async create(
    createPostOfBlogDto: CreatePostOfBlogDto,
    blogId: string,
  ): Promise<ViewPostDto | CustomErrorDto> {
    const blog: BlogDocument | null = await this.blogsRepository.findOne(blogId);
    if (!blog) return new CustomErrorDto(HttpStatus.NOT_FOUND, 'blog not found');

    const createdPost: PostDocument = await this.postsRepository.create(
      createPostOfBlogDto,
      blog.id,
      blog.name,
    );

    return PostsMapper.toView(createdPost);
  }

  async findOne(id: string) {
    return this.postsRepository.findById(id);
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<boolean> {
    const post = await this.postsRepository.findById(id);
    if (!post) return false;

    post.updatePost(updatePostDto);
    const result = await this.postsRepository.save(post);
    return result;
  }

  async updateLikeStatus(
    id: string,
    userId: string,
    userLogin: string,
    status: LikeStatusType,
  ): Promise<boolean | CustomErrorDto> {
    const post: PostDocument | null = await this.postsRepository.findById(id);
    if (!post) return new CustomErrorDto(HttpStatus.NOT_FOUND, 'post not found');

    const result = await this.likesService.like(
      userId,
      userLogin,
      LikeLocation.Post,
      post.id,
      status,
    );
    if (!result) return false;

    return true;
  }

  async remove(id: string): Promise<boolean> {
    return this.postsRepository.remove(id);
  }
}
