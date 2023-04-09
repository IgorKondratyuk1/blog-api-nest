import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from './schemas/blog.schema';
import { Model } from 'mongoose';
import { CreateBlogDto } from './dto/create-blog.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async save(blog: BlogDocument): Promise<boolean> {
    try {
      await blog.save();
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async create(userId: string, createBlogDto: CreateBlogDto): Promise<BlogDocument | null> {
    try {
      const newBlog: Blog = Blog.createInstance(userId, createBlogDto);
      const createdBlog = await this.blogModel.create(newBlog);
      return createdBlog;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findOne(id: string): Promise<BlogDocument | null> {
    try {
      return this.blogModel.findOne({ id });
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      const result = await this.blogModel.deleteOne({ id });
      return result.deletedCount === 1;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async removeAll(): Promise<boolean> {
    try {
      await this.blogModel.deleteMany({});
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
