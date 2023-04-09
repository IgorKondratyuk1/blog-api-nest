import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { CreateBlogDto } from '../dto/create-blog.dto';

export type BlogDocument = HydratedDocument<Blog>;

@Schema()
export class Blog {
  constructor(userId: string, name: string, websiteUrl: string, description: string) {
    this.id = randomUUID();
    this.name = name;
    this.description = description;
    this.websiteUrl = websiteUrl;
    this.isMembership = false;
    this.createdAt = new Date();
    this.userId = userId;
  }

  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String, maxlength: 300 })
  websiteUrl: string;

  @Prop({ type: String, maxlength: 1000 })
  description: string;

  @Prop({ type: Boolean })
  isMembership: boolean;

  @Prop({ type: Date, required: true })
  createdAt: Date;

  public updateBlog(updateBlogDto: UpdateBlogDto) {
    this.name = updateBlogDto.name;
    this.description = updateBlogDto.description;
    this.websiteUrl = updateBlogDto.websiteUrl;
  }

  public static createInstance(userId: string, createBlogDto: CreateBlogDto) {
    return new Blog(
      userId,
      createBlogDto.name,
      createBlogDto.websiteUrl,
      createBlogDto.description,
    );
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.methods = {
  updateBlog: Blog.prototype.updateBlog,
};

BlogSchema.statics = {
  createInstance: Blog.createInstance,
};
