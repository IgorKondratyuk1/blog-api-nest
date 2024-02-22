import { HttpStatus, Injectable } from '@nestjs/common';
import { PostMapper } from './utils/postMapper';
import { CustomErrorDto } from '../../../../common/dto/error';
import { LikeLocation, LikeStatusType } from '../likes/types/like';
import { LikesService } from '../likes/likes.service';
import { PostEntity } from './entities/post.entity';
import { BlogsRepository } from '../blogs/interfaces/blogs.repository';
import { PostsRepository } from './interfaces/posts.repository';
import { CreatePostOfBlogDto } from './models/input/create-post-of-blog.dto';
import { ViewPostDto } from './models/output/view-post.dto';
import { UpdatePostOfBlogDto } from './models/input/update-post-of-blog.dto';
import { BlogEntity } from '../blogs/entities/blog.entity';

@Injectable()
export class PostsService {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
    private likesService: LikesService,
  ) {}

  async findById(id: string): Promise<PostEntity | null> {
    return this.postsRepository.findById(id);
  }

  async create(
    userId: string,
    blogId: string,
    createPostOfBlogDto: CreatePostOfBlogDto,
  ): Promise<ViewPostDto | CustomErrorDto> {
    const blog: BlogEntity | null = await this.blogsRepository.findById(blogId);
    if (!blog) return new CustomErrorDto(HttpStatus.NOT_FOUND, 'blog not found');
    if (blog.userId !== userId) {
      return new CustomErrorDto(HttpStatus.FORBIDDEN, "blog doesn't belong to current user");
    }

    const postEntity: PostEntity = PostEntity.createInstance(userId, blog.id, blog.name, createPostOfBlogDto);
    const createdPost: PostEntity = await this.postsRepository.create(postEntity);
    return PostMapper.toView(createdPost);
  }

  async createByAdmin(blogId: string, createPostOfBlogDto: CreatePostOfBlogDto): Promise<ViewPostDto | CustomErrorDto> {
    const blog: BlogEntity | null = await this.blogsRepository.findById(blogId);
    if (!blog) return new CustomErrorDto(HttpStatus.NOT_FOUND, 'Blog not found');

    const postEntity: PostEntity = PostEntity.createInstance(null, blog.id, blog.name, createPostOfBlogDto);
    const createdPost: PostEntity = await this.postsRepository.create(postEntity);
    return PostMapper.toView(createdPost);
  }

  async updateLikeStatus(
    id: string,
    userId: string,
    userLogin: string,
    status: LikeStatusType,
  ): Promise<boolean | CustomErrorDto> {
    const post: PostEntity | null = await this.postsRepository.findById(id);
    if (!post) return new CustomErrorDto(HttpStatus.NOT_FOUND, 'post not found');

    const result = await this.likesService.like(userId, userLogin, LikeLocation.Post, post.id, status);
    if (!result) return false;

    return true;
  }

  async updateWithBlogId(
    userId: string,
    postId: string,
    blogId: string,
    updatePostDto: UpdatePostOfBlogDto,
  ): Promise<boolean | CustomErrorDto> {
    const post: PostEntity | null = await this.postsRepository.findById(postId);
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

  async updateWithBlogIdByAdmin(
    postId: string,
    blogId: string,
    updatePostDto: UpdatePostOfBlogDto,
  ): Promise<boolean | CustomErrorDto> {
    const post: PostEntity | null = await this.postsRepository.findById(postId);
    if (!post) {
      return new CustomErrorDto(HttpStatus.NOT_FOUND, 'post is not found');
    }

    if (post.blogId !== blogId) {
      return new CustomErrorDto(HttpStatus.NOT_FOUND, 'wrong blogId');
    }

    post.updatePost(updatePostDto);
    const result = await this.postsRepository.save(post);
    return result;
  }

  async setBanStatusByUserId(userId: string, isBanned: boolean): Promise<boolean> {
    return await this.postsRepository.setBanStatusByUserId(userId, isBanned);
  }

  async setBanStatusByBlogId(blogId: string, isBanned: boolean): Promise<boolean> {
    return await this.postsRepository.setBanStatusByBlogId(blogId, isBanned);
  }

  async removeWithBlogId(userId: string, postId: string, blogId: string): Promise<boolean | CustomErrorDto> {
    const post: PostEntity | null = await this.findById(postId);

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

  async removeWithBlogIdByAdmin(postId: string, blogId: string): Promise<boolean | CustomErrorDto> {
    const post: PostEntity | null = await this.findById(postId);

    if (!post) {
      return new CustomErrorDto(HttpStatus.NOT_FOUND, 'post is not found');
    }

    if (post.blogId !== blogId) {
      return new CustomErrorDto(HttpStatus.NOT_FOUND, 'wrong blogId');
    }

    return this.postsRepository.remove(postId);
  }
}
