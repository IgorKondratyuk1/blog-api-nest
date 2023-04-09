import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogsRepository } from './blogs.repository';
import { BlogMapper } from './utils/blogs.mapper';
import { BlogDocument } from './schemas/blog.schema';
import { ViewBlogDto } from './dto/view-blog.dto';
import { CustomErrorDto } from '../../../../common/dto/error';
import { UsersService } from '../../../users/users.service';

@Injectable()
export class BlogsService {
  constructor(private blogsRepository: BlogsRepository) {}

  async findById(id: string) {
    return await this.blogsRepository.findOne(id);
  }

  async create(userId: string, createBlogDto: CreateBlogDto): Promise<ViewBlogDto | CustomErrorDto> {
    const newBlog: BlogDocument | null = await this.blogsRepository.create(userId, createBlogDto);
    if (!newBlog) {
      return new CustomErrorDto(HttpStatus.INTERNAL_SERVER_ERROR, 'blog can not be created');
    }
    return BlogMapper.toView(newBlog);
  }

  // TODO Question what return in update method. Return Updated object or CustomErrorDto
  async update(userId: string, blogId: string, updateBlogDto: UpdateBlogDto): Promise<boolean | CustomErrorDto> {
    const blog: BlogDocument | null = await this.blogsRepository.findOne(blogId);
    if (!blog) return new CustomErrorDto(HttpStatus.NOT_FOUND, 'blog is not found');

    if (blog.userId !== userId) {
      return new CustomErrorDto(HttpStatus.FORBIDDEN, 'can not update not own blog');
    }

    blog.updateBlog(updateBlogDto);
    const updateResult: boolean = await this.blogsRepository.save(blog);
    return updateResult;
  }

  async remove(userId: string, blogId: string): Promise<boolean | CustomErrorDto> {
    const blog: BlogDocument | null = await this.findById(blogId);

    if (!blog) {
      return new CustomErrorDto(HttpStatus.NOT_FOUND, 'blog is not found');
    }

    if (blog.userId !== userId) {
      return new CustomErrorDto(HttpStatus.FORBIDDEN, 'can not delete not own blog');
    }

    return await this.blogsRepository.remove(blogId);
  }
}
