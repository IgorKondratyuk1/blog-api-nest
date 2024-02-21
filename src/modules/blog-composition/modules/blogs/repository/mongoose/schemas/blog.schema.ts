import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BanInfo, BanInfoSchema } from '../../../../../../ban/schemas/ban-info.schema';

@Schema()
export class BlogMongoEntity {
  constructor(
    id: string,
    userId: string,
    name: string,
    websiteUrl: string,
    description: string,
    isMembership: boolean,
    createdAt: Date,
    isBanned: boolean,
    banDate: Date | null,
  ) {
    this.id = id;
    this.name = name;
    this.websiteUrl = websiteUrl;
    this.description = description;
    this.isMembership = isMembership;
    this.createdAt = createdAt;
    this.userId = userId;
    this.banInfo = new BanInfo(isBanned, banDate);
  }

  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String })
  userId: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String, maxlength: 300 })
  websiteUrl: string;

  @Prop({ type: String, maxlength: 1000 })
  description: string;

  @Prop({ type: Boolean })
  isMembership: boolean;

  @Prop({
    type: Date,
    default: () => {
      new Date();
    },
  })
  createdAt: Date;

  @Prop({ type: BanInfoSchema, required: true })
  banInfo: BanInfo;
}

export type BlogDocument = HydratedDocument<BlogMongoEntity>;
export const BlogSchema = SchemaFactory.createForClass(BlogMongoEntity);
