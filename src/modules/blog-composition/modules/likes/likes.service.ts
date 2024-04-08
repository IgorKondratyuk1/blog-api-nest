import { Injectable } from '@nestjs/common';
import { LikeLocationsType, LikeStatus, LikeStatusType } from './types/like';
import { LikesRepository } from './interfaces/likes.repository';
import { LikeEntity } from './entities/like.entity';

@Injectable()
export class LikesService {
  constructor(private likesRepository: LikesRepository) {}

  async like(
    userId: string,
    userLogin: string,
    locationName: LikeLocationsType,
    locationId: string,
    status: LikeStatusType,
  ) {
    switch (status) {
      case LikeStatus.Like:
      case LikeStatus.Dislike:
        const updateResult = await this.createOrUpdateLike(userId, userLogin, locationName, locationId, status);
        return updateResult;
        break;
      case LikeStatus.None:
        const deleteResult = await this.removeLike(userId, locationName, locationId);
        return deleteResult;
        break;
      default:
        //new CustomErrorDto(HttpStatus.NOT_FOUND, `like status (${status}) not found`);
        return false;
    }
  }

  async createOrUpdateLike(
    userId: string,
    userLogin: string,
    locationName: LikeLocationsType,
    locationId: string,
    status: LikeStatusType,
  ): Promise<boolean> {
    try {
      // 1. Find like status
      const foundedLike: LikeEntity | null = await this.likesRepository.getUserLike(userId, locationId, locationName);

      // 2. If like founded: update existing likeObject status
      if (foundedLike) {
        foundedLike.setLikeStatus(status);
        await this.likesRepository.save(foundedLike);
        return true;
      }

      // Else (if like doesn't found): create new like
      const createLike = LikeEntity.createInstance(userId, userLogin, locationName, locationId, status);
      await this.likesRepository.create(createLike);

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async setBanStatusToUserLikes(userId: string, isBanned: boolean): Promise<boolean> {
    return await this.likesRepository.setBanStatusToUserLikes(userId, isBanned);
  }

  async removeLike(userId: string, locationName: LikeLocationsType, locationId: string): Promise<boolean> {
    const result: boolean = await this.likesRepository.removeLike(locationId, locationName, userId);
    return result;
  }

  async removeAll(): Promise<boolean> {
    return await this.likesRepository.removeAll();
  }
}
