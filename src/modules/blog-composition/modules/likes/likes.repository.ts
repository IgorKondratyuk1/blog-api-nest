import { Injectable } from '@nestjs/common';
import { Like, LikeDocument } from './schemas/like.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LikeLocationsType, LikeStatus, LikeStatusType } from './types/like';
import { LikesDislikesCountDto } from './dto/likes-dislikes-count.dto';

@Injectable()
export class LikesRepository {
  constructor(@InjectModel(Like.name) private likeModel: Model<LikeDocument>) {}

  async save(like: LikeDocument) {
    await like.save();
  }

  async create(
    userId: string,
    userLogin: string,
    locationName: LikeLocationsType,
    locationId: string,
    likeStatus: LikeStatusType,
  ): Promise<LikeDocument | null> {
    try {
      const newLike: Like = Like.createInstance(userId, userLogin, locationName, locationId, likeStatus);
      const createdLike = await this.likeModel.create(newLike);
      return createdLike;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async getUserLike(userId: string, locationId: string, locationName: string): Promise<LikeDocument | null> {
    const dbLike: LikeDocument | null = await this.likeModel.findOne({
      userId,
      locationId,
      locationName,
      isBanned: false,
    });
    return dbLike;
  }

  async getUserLikeStatus(
    userId: string,
    locationId: string,
    locationName: LikeLocationsType,
  ): Promise<LikeStatusType> {
    const dbLike: LikeDocument | null = await this.likeModel.findOne({
      userId,
      locationId,
      locationName,
    });

    return dbLike ? dbLike.myStatus : LikeStatus.None;
  }

  async getLikeOrDislikesCount(locationId: string, likeStatus: LikeStatusType): Promise<number> {
    const count: number = await this.likeModel.countDocuments({
      locationId,
      myStatus: likeStatus,
      isBanned: false,
    });

    return count;
  }

  async getLikesAndDislikesCount(locationId: string): Promise<LikesDislikesCountDto> {
    const likesCount: number = await this.getLikeOrDislikesCount(locationId, LikeStatus.Like);
    const dislikesCount: number = await this.getLikeOrDislikesCount(locationId, LikeStatus.Dislike);
    return new LikesDislikesCountDto(likesCount, dislikesCount);
  }

  // TODO .lean() like type
  async getLastLikesInfo(
    locationId: string,
    locationName: LikeLocationsType,
    limitCount: number,
  ): Promise<Like[] | null> {
    const dbLikes: Like[] | null = await this.likeModel
      .find({
        locationId,
        locationName,
        myStatus: 'Like',
        isBanned: false,
      })
      .sort({ createdAt: -1 })
      .limit(limitCount)
      .lean();
    return dbLikes;
  }

  async setBanStatusToUserLikes(userId: string, isBanned: boolean) {
    try {
      await this.likeModel.updateMany({ userId }, { isBanned });
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async deleteLike(locationId: string, locationName: string, userId: string): Promise<boolean> {
    try {
      const result = await this.likeModel.deleteOne({ userId, locationId, locationName });
      if (!result) return false;

      return result.deletedCount === 1;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async deleteLikesOfLocation(locationId: string, locationName: string): Promise<boolean> {
    try {
      const result = await this.likeModel.deleteMany({ locationId, locationName });
      if (!result) return false;

      return result.deletedCount >= 0;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async deleteAllLikes(): Promise<boolean> {
    try {
      await this.likeModel.deleteMany({});
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
