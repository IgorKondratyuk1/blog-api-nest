import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CommentsRepository {
  constructor(@InjectModel(Comment.name) private commentModel: Model<CommentDocument>) {}

  async save(comment: CommentDocument): Promise<boolean> {
    try {
      await comment.save();
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async create(
    createCommentDto: CreateCommentDto,
    userId: string,
    userLogin: string,
    postId: string,
  ): Promise<Comment | null> {
    try {
      const newComment: Comment = Comment.createInstance(
        createCommentDto,
        userId,
        userLogin,
        postId,
      );
      await this.commentModel.create(newComment);
      return newComment;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findOne(id: string): Promise<CommentDocument | null> {
    try {
      return this.commentModel.findOne({ id });
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      const result = await this.commentModel.deleteOne({ id });
      return result.deletedCount !== 1;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async removeAll() {
    try {
      await this.commentModel.deleteMany({});
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
