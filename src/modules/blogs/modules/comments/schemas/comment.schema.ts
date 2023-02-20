import { randomUUID } from 'crypto';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CommentatorInfo, CommentatorInfoSchema } from './commentatorInfo.schema';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { CreateCommentDto } from '../dto/create-comment.dto';

export type CommentDocument = HydratedDocument<Comment>;

@Schema()
export class Comment {
  constructor(content: string, userId: string, userLogin: string, postId: string) {
    this.id = randomUUID();
    this.createdAt = new Date();
    this.content = content;
    this.commentatorInfo = new CommentatorInfo(userId, userLogin);
    this.postId = postId;
  }

  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String })
  content: string;

  @Prop({ type: String, required: true })
  postId: string;

  @Prop({ type: CommentatorInfoSchema, required: true })
  commentatorInfo: CommentatorInfo;

  @Prop({
    type: Date,
    default: () => {
      new Date();
    },
  })
  createdAt: Date;

  public updateComment(updateCommentDto: UpdateCommentDto) {
    this.content = updateCommentDto.content;
  }

  public static createInstance(
    createCommentDto: CreateCommentDto,
    userId: string,
    userLogin: string,
    postId: string,
  ) {
    return new Comment(createCommentDto.content, userId, userLogin, postId);
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.methods = {
  updateBlog: Comment.prototype.updateComment,
};

CommentSchema.statics = {
  createInstance: Comment.createInstance,
};
