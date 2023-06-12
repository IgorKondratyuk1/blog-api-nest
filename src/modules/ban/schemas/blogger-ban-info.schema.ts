import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BanLocation, BanLocationType } from '../types/ban-locations';
import { HydratedDocument } from 'mongoose';
import { randomUUID } from 'crypto';
import { BanByBloggerDto } from '../dto/ban-by-blogger.dto';

export type BloggerBanInfoDocument = HydratedDocument<BloggerBanInfo>;

@Schema()
export class BloggerBanInfo {
  constructor(
    userId: string,
    userLogin: string,
    banReason: string,
    authorId: string,
    locationId: string,
    locationName: BanLocationType,
  ) {
    this.id = randomUUID();
    this.createdAt = new Date();
    this.userId = userId;
    this.userLogin = userLogin;
    this.banReason = banReason;
    this.authorId = authorId;
    this.locationId = locationId;
    this.locationName = locationName;
  }

  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  userLogin: string;

  @Prop({ type: String, required: true })
  authorId: string;

  @Prop({ type: String, required: true })
  banReason: string;

  @Prop({ type: String, required: true })
  locationId: string;

  @Prop({ type: String, required: true, enum: BanLocation })
  locationName: BanLocationType;

  @Prop({ type: Date, default: () => new Date() })
  createdAt: Date;

  public static createInstance(bloggerBanDto: BanByBloggerDto) {
    return new BloggerBanInfo(
      bloggerBanDto.userId,
      bloggerBanDto.userLogin,
      bloggerBanDto.banReason,
      bloggerBanDto.authorId,
      bloggerBanDto.locationId,
      bloggerBanDto.locationName,
    );
  }
}

export const BloggerBanInfoSchema = SchemaFactory.createForClass(BloggerBanInfo);

BloggerBanInfoSchema.statics = {
  createInstance: BloggerBanInfo.createInstance,
};
