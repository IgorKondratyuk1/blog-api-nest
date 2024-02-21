import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class PostMongoEntity {
  constructor(
    id: string,
    userId: string,
    title: string,
    blogId: string,
    shortDescription: string,
    content: string,
    blogName: string,
    createdAt: Date,
    isBanned: boolean,
  ) {
    this.id = id;
    this.userId = userId;
    this.title = title;
    this.shortDescription = shortDescription;
    this.content = content;
    this.blogId = blogId;
    this.blogName = blogName;
    this.createdAt = createdAt;
    this.isBanned = isBanned;
  }

  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String })
  title: string;

  @Prop({ type: String })
  shortDescription: string;

  @Prop({ type: String })
  content: string;

  @Prop({ type: String, required: true })
  blogId: string;

  @Prop({ type: String, required: true })
  blogName: string;

  @Prop({
    type: Date,
    default: () => {
      new Date();
    },
  })
  createdAt: Date;

  @Prop({ type: Boolean, required: true, default: false })
  isBanned: boolean;
}

export type PostDocument = HydratedDocument<PostMongoEntity>;
export const PostSchema = SchemaFactory.createForClass(PostMongoEntity);
