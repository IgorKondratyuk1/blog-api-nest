import { HttpStatus, Injectable } from '@nestjs/common';
import { LikesRepository } from './likes.repository';
import { LikeLocationsType, LikeStatusType } from './types/like';
import { LikeDocument } from './schemas/like.schema';

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
      case 'Like':
      case 'Dislike':
        const updateResult = await this.createOrUpdateLike(userId, userLogin, locationName, locationId, status);
        return updateResult;
        break;
      case 'None':
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
      const foundedLike: LikeDocument | null = await this.likesRepository.getUserLike(userId, locationId, locationName);

      // 2. If like founded: update existing likeObject status
      //    Else: create new likeObject
      if (foundedLike) {
        await foundedLike.setLikeStatus(status);
        await this.likesRepository.save(foundedLike);
      } else {
        await this.likesRepository.create(userId, userLogin, locationName, locationId, status);
      }

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
    const result: boolean = await this.likesRepository.deleteLike(locationId, locationName, userId);
    return result;
  }

  async removeAll(): Promise<boolean> {
    return await this.likesRepository.deleteAllLikes();
  }
}
