import { LikeStatus, LikeStatusType } from '../types/like';
import { LikesInfo } from './likes-info.dto';
import { LikeDetails } from './like-details.sto';

export class ExtendedLikesInfo extends LikesInfo {
  constructor(
    likesCount = 0,
    dislikesCount = 0,
    myStatus: LikeStatusType = LikeStatus.None,
    public newestLikes: LikeDetails[] = [],
  ) {
    super(likesCount, dislikesCount, myStatus);
  }
}
