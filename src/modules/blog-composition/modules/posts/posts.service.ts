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
import { Post, PostDocument } from './schemas/post.schema';
import { CreatePostOfBlogDto } from './dto/create-post-of-blog.dto';
import { UpdatePostOfBlogDto } from './dto/update-post-of-blog.dto';

@Injectable()
export class PostsService {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
    private likesService: LikesService,
  ) {}

  async findById(id: string): Promise<PostDocument | null> {
    return this.postsRepository.findById(id);
  }

  async create(
    userId: string,
    blogId: string,
    createPostOfBlogDto: CreatePostOfBlogDto,
  ): Promise<ViewPostDto | CustomErrorDto> {
    const blog: BlogDocument | null = await this.blogsRepository.findById(blogId);
    if (!blog) return new CustomErrorDto(HttpStatus.NOT_FOUND, 'blog not found');
    if (blog.userId !== userId) {
      return new CustomErrorDto(HttpStatus.FORBIDDEN, "blog doesn't belong to current user");
    }

    const createdPost: PostDocument = await this.postsRepository.create(
      userId,
      createPostOfBlogDto,
      blog.id,
      blog.name,
    );

    return PostsMapper.toView(createdPost);
  }

  async updateLikeStatus(
    id: string,
    userId: string,
    userLogin: string,
    status: LikeStatusType,
  ): Promise<boolean | CustomErrorDto> {
    const post: PostDocument | null = await this.postsRepository.findById(id);
    if (!post) return new CustomErrorDto(HttpStatus.NOT_FOUND, 'post not found');

    const result = await this.likesService.like(userId, userLogin, LikeLocation.Post, post.id, status);
    if (!result) return false;

    return true;
  }

  // TODO leave only one update
  // async update(userId: string, postId: string, updatePostDto: UpdatePostDto): Promise<boolean | CustomErrorDto> {
  //   const post: PostDocument | null = await this.postsRepository.findById(postId);
  //   if (!post) {
  //     return new CustomErrorDto(HttpStatus.NOT_FOUND, 'post is not found');
  //   }
  //
  //   if (post.userId !== userId) {
  //     return new CustomErrorDto(HttpStatus.FORBIDDEN, 'can not update not own blog');
  //   }
  //
  //   post.updatePost(updatePostDto);
  //   const result = await this.postsRepository.save(post);
  //   return result;
  // }

  async updateWithBlogId(
    userId: string,
    postId: string,
    blogId: string,
    updatePostDto: UpdatePostOfBlogDto,
  ): Promise<boolean | CustomErrorDto> {
    const post: PostDocument | null = await this.postsRepository.findById(postId);
    if (!post) {
      return new CustomErrorDto(HttpStatus.NOT_FOUND, 'post is not found');
    }

    if (post.blogId !== blogId) {
      return new CustomErrorDto(HttpStatus.NOT_FOUND, 'wrong blogId');
    }

    if (post.userId !== userId) {
      return new CustomErrorDto(HttpStatus.FORBIDDEN, 'can not update not own blog');
    }

    post.updatePost(updatePostDto);
    const result = await this.postsRepository.save(post);
    return result;
  }

  async setBanStatusByUserId(userId: string, isBanned: boolean): Promise<boolean> {
    return await this.postsRepository.setBanStatusByUserId(userId, isBanned);
  }

  async setBanStatusByBlogId(blogId: string, isBanned: boolean): Promise<boolean> {
    return await this.postsRepository.setBanStatusToByBlogId(blogId, isBanned);
  }

  // TODO leave only one remove
  // async remove(userId: string, postId: string): Promise<boolean | CustomErrorDto> {
  //   const post: PostDocument | null = await this.findOne(postId);
  //
  //   if (!post) {
  //     return new CustomErrorDto(HttpStatus.NOT_FOUND, 'post is not found');
  //   }
  //
  //   if (post.userId !== userId) {
  //     return new CustomErrorDto(HttpStatus.FORBIDDEN, 'can not update not own post');
  //   }
  //
  //   return this.postsRepository.remove(postId);
  // }

  async removeWithBlogId(userId: string, postId: string, blogId: string): Promise<boolean | CustomErrorDto> {
    const post: PostDocument | null = await this.findById(postId);

    if (!post) {
      return new CustomErrorDto(HttpStatus.NOT_FOUND, 'post is not found');
    }

    if (post.blogId !== blogId) {
      return new CustomErrorDto(HttpStatus.NOT_FOUND, 'wrong blogId');
    }

    if (post.userId !== userId) {
      return new CustomErrorDto(HttpStatus.FORBIDDEN, 'can not update not own post');
    }

    return this.postsRepository.remove(postId);
  }
}
