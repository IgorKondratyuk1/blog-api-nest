import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateBlogDto } from './models/input/create-blog.dto';
import { UpdateBlogDto } from './models/input/update-blog.dto';
import { BlogMapper } from './utils/blogs.mapper';
import { ViewBlogDto } from './models/output/view-blog.dto';
import { CustomErrorDto } from '../../../../common/dto/error';
import { BanBlogDto } from './models/input/ban-blog.dto';
import { BlogEntity } from './entities/blog.entity';
import { BlogsRepository } from './interfaces/blogs.repository';

@Injectable()
export class BlogsService {
  constructor(private blogsRepository: BlogsRepository) {}

  async findById(id: string) {
    return await this.blogsRepository.findById(id);
  }

  async create(userId: string, createBlogDto: CreateBlogDto): Promise<ViewBlogDto | CustomErrorDto> {
    const blogEntity: BlogEntity = BlogEntity.createInstance(userId, createBlogDto);
    const newBlog: BlogEntity | null = await this.blogsRepository.create(blogEntity);
    if (!newBlog) {
      return new CustomErrorDto(HttpStatus.INTERNAL_SERVER_ERROR, 'blog can not be created');
    }

    return BlogMapper.toView(newBlog);
  }

  // TODO Question what return in update method. Return Updated object or CustomErrorDto
  async update(userId: string, blogId: string, updateBlogDto: UpdateBlogDto): Promise<boolean | CustomErrorDto> {
    const blog: BlogEntity | null = await this.blogsRepository.findById(blogId);
    if (!blog) return new CustomErrorDto(HttpStatus.NOT_FOUND, 'blog is not found');

    if (blog.userId !== userId) {
      return new CustomErrorDto(HttpStatus.FORBIDDEN, 'can not update not own blog');
    }

    blog.updateBlog(updateBlogDto);
    const updateResult: boolean = await this.blogsRepository.save(blog);

    return updateResult;
  }

  async remove(userId: string, blogId: string): Promise<boolean | CustomErrorDto> {
    const blog: BlogEntity | null = await this.findById(blogId);

    if (!blog) {
      return new CustomErrorDto(HttpStatus.NOT_FOUND, 'blog is not found');
    }

    if (blog.userId !== userId) {
      return new CustomErrorDto(HttpStatus.FORBIDDEN, 'can not delete not own blog');
    }

    return await this.blogsRepository.remove(blogId);
  }

  async removeByAdmin(blogId: string): Promise<boolean | CustomErrorDto> {
    const blog: BlogEntity | null = await this.findById(blogId);

    if (!blog) {
      return new CustomErrorDto(HttpStatus.NOT_FOUND, 'blog is not found');
    }

    return await this.blogsRepository.remove(blogId);
  }

  async setBlogBanStatus(blogId: string, banBlogDto: BanBlogDto): Promise<boolean | CustomErrorDto> {
    const blog: BlogEntity | null = await this.blogsRepository.findById(blogId);
    if (!blog) return new CustomErrorDto(HttpStatus.NOT_FOUND, 'blog not found');

    blog.setIsBanned(banBlogDto.isBanned);
    await this.blogsRepository.save(blog);
    return true;
  }
}
