import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsRepository } from './posts.repository';
import { BlogDocument } from '../blogs/schemas/blog.schema';
import { BlogsRepository } from '../blogs/blogs.repository';
import { PostsMapper } from './utils/posts.mapper';
import { ViewLimitedPostDto } from './dto/view-limited-post.dto';

@Injectable()
export class PostsService {
  constructor(private postsRepository: PostsRepository, private blogsRepository: BlogsRepository) {}

  async create(createPostDto: CreatePostDto, blogId: string): Promise<ViewLimitedPostDto> {
    if (!blogId) throw new BadRequestException('Wrong blogId');

    const blog: BlogDocument | null = await this.blogsRepository.findOne(blogId);
    if (!blog) throw new NotFoundException('Blog is not found');

    const createdPost = await this.postsRepository.create(createPostDto, blog.id, blog.name);

    return PostsMapper.toLimitedView(createdPost);
  }

  async findOne(id: string) {
    return this.postsRepository.findOne(id);
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<boolean> {
    const post = await this.postsRepository.findOne(id);
    if (!post) return false;

    post.updatePost(updatePostDto);
    const result = await this.postsRepository.save(post);
    return result;
  }

  async remove(id: string): Promise<boolean> {
    return this.postsRepository.remove(id);
  }
}
