import { LikeStatusType } from '../../../../src/modules/blog-composition/modules/likes/types/like';

export type ViewLikeModel = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatusType;
};
