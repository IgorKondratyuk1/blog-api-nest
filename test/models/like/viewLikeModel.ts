import { LikeStatusType } from '../../../src/modules/blogs-composition/modules/likes/types/like';

export type ViewLikeModel = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatusType;
};
