import { InjectModel } from '@nestjs/mongoose';
import { BlogMongoEntity, BlogDocument } from './schemas/blog.schema';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../../interfaces/blogs.repository';
import { BlogEntity } from '../../entities/blog.entity';
import { BlogMapper } from '../../utils/blogs.mapper';

@Injectable()
export class BlogsMongoRepository extends BlogsRepository {
  constructor(@InjectModel(BlogMongoEntity.name) private blogModel: Model<BlogDocument>) {
    super();
  }

  async save(blogEntity: BlogEntity): Promise<boolean> {
    try {
      const savingBlog = new this.blogModel(BlogMapper.toMongo(blogEntity));
      const result = await this.blogModel.findByIdAndUpdate(blogEntity.id, savingBlog);
      return !!result;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async create(blogEntity: BlogEntity): Promise<BlogEntity | null> {
    try {
      const newBlog = new this.blogModel(BlogMapper.toMongo(blogEntity));
      const createdBlog = await this.blogModel.create(newBlog);
      return BlogMapper.toDomainFromMongo(createdBlog);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findById(id: string): Promise<BlogEntity | null> {
    try {
      const foundedBlog = await this.blogModel.findOne({ id });
      return foundedBlog ? BlogMapper.toDomainFromMongo(foundedBlog) : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findByUserId(userId: string): Promise<BlogEntity[]> {
    try {
      const foundedBlogs = await this.blogModel.find({ userId });
      return foundedBlogs ? foundedBlogs.map(BlogMapper.toDomainFromMongo) : [];
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
