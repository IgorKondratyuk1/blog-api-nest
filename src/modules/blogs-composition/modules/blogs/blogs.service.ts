import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogsRepository } from './blogs.repository';
import { BlogMapper } from './utils/blogs.mapper';
import { BlogDocument } from './schemas/blog.schema';
import { ViewBlogDto } from './dto/view-blog.dto';
import { CustomErrorDto } from '../../../../common/dto/error';

@Injectable()
export class BlogsService {
  constructor(private blogsRepository: BlogsRepository) {}

  async create(createBlogDto: CreateBlogDto): Promise<ViewBlogDto | CustomErrorDto> {
    const newBlog: BlogDocument | null = await this.blogsRepository.create(createBlogDto);
    if (!newBlog) {
      return new CustomErrorDto(HttpStatus.INTERNAL_SERVER_ERROR, 'blog can not be created');
    }
    return BlogMapper.toView(newBlog);
  }

  async findOne(id: string) {
    return await this.blogsRepository.findOne(id);
  }

  // TODO what return in update method
  // TODO make CustomError in other services
  async update(id: string, updateBlogDto: UpdateBlogDto): Promise<boolean> {
    const result: BlogDocument | null = await this.blogsRepository.findOne(id);
    if (!result) return false;

    result.updateBlog(updateBlogDto);
    const updateResult: boolean = await this.blogsRepository.save(result);
    return updateResult;
  }

  async remove(id: string) {
    return await this.blogsRepository.remove(id);
  }
}
