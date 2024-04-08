import { LikeStatus, LikeStatusType } from '../../types/like';
import { LikesInfoDto } from './likes-info.dto';
import { LikeDetails } from './like-details.dto';

export class ExtendedLikesInfo extends LikesInfoDto {
  constructor(
    likesCount = 0,
    dislikesCount = 0,
    myStatus: LikeStatusType = LikeStatus.None,
    public newestLikes: LikeDetails[] = [],
  ) {
    super(likesCount, dislikesCount, myStatus);
  }
}
