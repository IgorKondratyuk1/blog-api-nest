import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CommentatorInfoMongoEntity, CommentatorInfoSchema } from './commentator-info.schema';

@Schema()
export class CommentMongoEntity {
  constructor(
    id: string,
    createdAt: Date,
    content: string,
    commentatorInfo: CommentatorInfoMongoEntity,
    postId: string,
    blogId: string,
    isBanned: boolean,
  ) {
    this.id = id;
    this.createdAt = createdAt;
    this.content = content;
    this.commentatorInfo = commentatorInfo; //new CommentatorInfoEntity(userId, userLogin);
    this.postId = postId;
    this.blogId = blogId;
    this.isBanned = isBanned;
  }

  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String })
  content: string;

  @Prop({ type: String, required: true })
  postId: string;

  @Prop({ type: String, required: true })
  blogId: string;

  @Prop({ type: CommentatorInfoSchema, required: true })
  commentatorInfo: CommentatorInfoMongoEntity;

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

export const CommentSchema = SchemaFactory.createForClass(CommentMongoEntity);
export type CommentDocument = HydratedDocument<CommentMongoEntity>;
