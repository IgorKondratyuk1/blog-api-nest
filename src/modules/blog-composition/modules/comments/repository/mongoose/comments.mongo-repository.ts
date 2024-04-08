import { Injectable } from '@nestjs/common';
import { CommentDocument, CommentMongoEntity } from './schemas/comment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommentsRepository } from '../../interfaces/comments.repository';
import { CommentEntity } from '../../entities/comment.entity';
import { CommentsMapper } from '../../utils/comments.mapper';

@Injectable()
export class CommentsMongoRepository extends CommentsRepository {
  constructor(@InjectModel(CommentMongoEntity.name) private commentModel: Model<CommentDocument>) {
    super();
  }

  async save(commentEntity: CommentEntity): Promise<boolean> {
    try {
      const savingComment = new this.commentModel(CommentsMapper.toMongo(commentEntity));
      const result = await this.commentModel.findByIdAndUpdate(commentEntity.id, savingComment);
      return !!result;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async create(commentEntity: CommentEntity): Promise<CommentEntity | null> {
    try {
      const newComment = new this.commentModel(CommentsMapper.toMongo(commentEntity));
      const createdComment = await this.commentModel.create(newComment);
      return CommentsMapper.toDomainFromMongo(createdComment);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findById(id: string): Promise<CommentEntity | null> {
    try {
      const foundedComment = await this.commentModel.findOne({ id });
      return foundedComment ? CommentsMapper.toDomainFromMongo(foundedComment) : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async setBanStatusToUserComments(userId: string, isBanned: boolean): Promise<boolean> {
    try {
      await this.commentModel.updateMany({ 'commentatorInfo.userId': userId }, { isBanned });
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      const result = await this.commentModel.deleteOne({ id });
      return result.deletedCount === 1;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async removeAll(): Promise<boolean> {
    try {
      await this.commentModel.deleteMany({});
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
