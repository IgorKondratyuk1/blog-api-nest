import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { BloggerBanInfo, BloggerBanInfoDocument } from './schemas/blogger-ban-info.schema';
import { BanByBloggerDto } from './dto/ban-by-blogger.dto';

@Injectable()
export class BloggerBanInfoRepository {
  constructor(@InjectModel(BloggerBanInfo.name) private bloggerBanModel: Model<BloggerBanInfoDocument>) {}

  async save(banInfo: BloggerBanInfoDocument): Promise<boolean> {
    try {
      await banInfo.save();
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async create(bloggerBanDto: BanByBloggerDto): Promise<BloggerBanInfoDocument | null> {
    try {
      const newBan: BloggerBanInfo = BloggerBanInfo.createInstance(bloggerBanDto);
      const createdBan = await this.bloggerBanModel.create(newBan);
      return createdBan;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findByUserIdAndBlogId(userId: string, blogId: string): Promise<BloggerBanInfoDocument | null> {
    try {
      return this.bloggerBanModel.findOne({ userId, blogId });
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async removeByUserIdAndBlogId(userId: string, blogId: string): Promise<boolean> {
    try {
      const result = await this.bloggerBanModel.deleteOne({ userId, blogId });
      return result.deletedCount === 1;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async removeAll(): Promise<boolean> {
    try {
      await this.bloggerBanModel.deleteMany({});
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
