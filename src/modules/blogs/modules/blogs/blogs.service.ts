import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogsRepository } from './blogs.repository';
import { BlogMapper } from './utils/blogs.mapper';

@Injectable()
export class BlogsService {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async create(createBlogDto: CreateBlogDto) {
    const newBlog = await this.blogsRepository.create(createBlogDto);
    return BlogMapper.toView(newBlog);
  }

  async findOne(id: string) {
    return await this.blogsRepository.findOne(id);
  }

  // TODO what return in update method
  async update(id: string, updateBlogDto: UpdateBlogDto): Promise<boolean> {
    const blog = await this.blogsRepository.findOne(id);
    if (!blog) return false;

    blog.updateBlog(updateBlogDto);
    const result: boolean = await this.blogsRepository.save(blog);
    return result;
  }

  async remove(id: string) {
    return await this.blogsRepository.remove(id);
  }
}
