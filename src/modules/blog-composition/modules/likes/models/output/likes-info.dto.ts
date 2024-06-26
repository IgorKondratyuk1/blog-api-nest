import { LikeStatus, LikeStatusType } from '../../types/like';

export class LikesInfoDto {
  constructor(
    public likesCount: number = 0,
    public dislikesCount: number = 0,
    public myStatus: LikeStatusType = LikeStatus.None,
  ) {}
}
