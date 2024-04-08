import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LikeLocationsType, LikeStatus, LikeStatusType } from '../../types/like';
import { LikesDislikesCountDto } from '../../models/output/likes-dislikes-count.dto';
import { LikeDocument, LikeMongoEntity } from './schemas/like.schema';
import { LikeEntity } from '../../entities/like.entity';
import { LikesRepository } from '../../interfaces/likes.repository';
import { LikesMapper } from '../../utils/likes.mapper';

@Injectable()
export class LikesMongoRepository extends LikesRepository {
  constructor(@InjectModel(LikeMongoEntity.name) private likeModel: Model<LikeDocument>) {
    super();
  }

  async save(likeEntity: LikeEntity) {
    try {
      const savingLike = new this.likeModel(LikesMapper.toMongo(likeEntity));
      const result = await this.likeModel.findByIdAndUpdate(likeEntity.id, savingLike);
      return !!result;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async create(likeEntity: LikeEntity): Promise<LikeEntity | null> {
    try {
      const newLike = new this.likeModel(LikesMapper.toMongo(likeEntity));
      const createdLike = await this.likeModel.create(newLike);
      return LikesMapper.toDomainFromMongo(createdLike);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async getUserLike(userId: string, locationId: string, locationName: string): Promise<LikeEntity | null> {
    const dbLike: LikeDocument | null = await this.likeModel.findOne({
      userId,
      locationId,
      locationName,
      isBanned: false,
    });
    return LikesMapper.toDomainFromMongo(dbLike);
  }

  async getUserLikeStatus(
    userId: string,
    locationId: string,
    locationName: LikeLocationsType,
  ): Promise<LikeStatusType> {
    const dbLike: LikeEntity | null = await this.likeModel.findOne({
      userId,
      locationId,
      locationName,
    });

    return dbLike ? dbLike.myStatus : LikeStatus.None;
  }

  async getLikeOrDislikesCount(
    locationId: string,
    locationName: LikeLocationsType,
    likeStatus: LikeStatusType,
  ): Promise<number> {
    const count: number = await this.likeModel.countDocuments({
      locationId,
      locationName: locationName,
      myStatus: likeStatus,
      isBanned: false,
    });

    return count;
  }

  async getLikesAndDislikesCount(locationId: string, locationName: LikeLocationsType): Promise<LikesDislikesCountDto> {
    const likesCount: number = await this.getLikeOrDislikesCount(locationId, locationName, LikeStatus.Like);
    const dislikesCount: number = await this.getLikeOrDislikesCount(locationId, locationName, LikeStatus.Dislike);
    return new LikesDislikesCountDto(likesCount, dislikesCount);
  }

  async getLastLikesInfo(
    locationId: string,
    locationName: LikeLocationsType,
    limitCount: number,
  ): Promise<LikeEntity[] | null> {
    const dbLikes: LikeDocument[] | null = await this.likeModel
      .find({
        locationId,
        locationName,
        myStatus: 'Like',
        isBanned: false,
      })
      .sort({ createdAt: -1 })
      .limit(limitCount)
      .lean();
    return dbLikes.map(LikesMapper.toDomainFromMongo);
  }

  async setBanStatusToUserLikes(userId: string, isBanned: boolean): Promise<boolean> {
    try {
      await this.likeModel.updateMany({ userId }, { isBanned });
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async removeLike(locationId: string, locationName: string, userId: string): Promise<boolean> {
    try {
      const result = await this.likeModel.deleteOne({ userId, locationId, locationName });
      if (!result) return false;

      return result.deletedCount === 1;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async removeLikesByLocation(locationId: string, locationName: string): Promise<boolean> {
    try {
      const result = await this.likeModel.deleteMany({ locationId, locationName });
      if (!result) return false;

      return result.deletedCount >= 0;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async removeAll(): Promise<boolean> {
    try {
      await this.likeModel.deleteMany({});
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
