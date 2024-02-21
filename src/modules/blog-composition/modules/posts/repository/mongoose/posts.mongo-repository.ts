import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostMongoEntity, PostDocument } from './schemas/post.schema';
import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../../interfaces/posts.repository';
import { PostEntity } from '../../entities/post.entity';
import { PostMapper } from '../../utils/postMapper';

@Injectable()
export class PostsMongoRepository extends PostsRepository {
  constructor(@InjectModel(PostMongoEntity.name) private postModel: Model<PostDocument>) {
    super();
  }

  async save(postEntity: PostEntity) {
    try {
      const savingPost = new this.postModel(PostMapper.toMongo(postEntity));
      const result = await this.postModel.findByIdAndUpdate(postEntity.id, savingPost);
      return !!result;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async create(postEntity: PostEntity): Promise<PostEntity> {
    const newPost: PostMongoEntity = new this.postModel(PostMapper.toMongo(postEntity));
    const createdPost = await this.postModel.create(newPost);
    return PostMapper.toDomainFromMongo(createdPost);
  }

  async findById(id: string): Promise<PostEntity | null> {
    try {
      const foundedPost = await this.postModel.findOne({ id });
      return foundedPost ? PostMapper.toDomainFromMongo(foundedPost) : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async setBanStatusByUserId(userId: string, isBanned: boolean): Promise<boolean> {
    try {
      await this.postModel.updateMany({ userId }, { isBanned });
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async setBanStatusByBlogId(blogId: string, isBanned: boolean): Promise<boolean> {
    try {
      await this.postModel.updateMany({ blogId }, { isBanned });
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      const result = await this.postModel.deleteOne({ id });
      return result.deletedCount === 1;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async removeAll(): Promise<boolean> {
    try {
      await this.postModel.deleteMany({});
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
