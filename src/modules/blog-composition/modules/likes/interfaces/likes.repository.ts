import { LikeEntity } from '../entities/like.entity';
import { LikeLocationsType, LikeStatusType } from '../types/like';
import { LikesDislikesCountDto } from '../models/output/likes-dislikes-count.dto';

export abstract class LikesRepository {
  public abstract save(like: LikeEntity): Promise<boolean>;

  public abstract create(likeEntity: LikeEntity): Promise<LikeEntity | null>;

  public abstract getUserLike(userId: string, locationId: string, locationName: string): Promise<LikeEntity | null>;

  public abstract getUserLikeStatus(
    userId: string,
    locationId: string,
    locationName: LikeLocationsType,
  ): Promise<LikeStatusType>;

  public abstract getLikeOrDislikesCount(
    locationId: string,
    locationName: LikeLocationsType,
    likeStatus: LikeStatusType,
  ): Promise<number>;

  public abstract getLikesAndDislikesCount(
    locationId: string,
    locationName: LikeLocationsType,
  ): Promise<LikesDislikesCountDto>;

  public abstract getLastLikesInfo(
    locationId: string,
    locationName: LikeLocationsType,
    limitCount: number,
  ): Promise<LikeEntity[]>;

  public abstract setBanStatusToUserLikes(userId: string, isBanned: boolean): Promise<boolean>;

  public abstract removeLike(locationId: string, locationName: string, userId: string): Promise<boolean>;

  public abstract removeLikesByLocation(locationId: string, locationName: string): Promise<boolean>;

  public abstract removeAll(): Promise<boolean>;
}
