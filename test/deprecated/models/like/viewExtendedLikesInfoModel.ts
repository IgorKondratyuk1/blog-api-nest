import { LikeStatusType } from '../../../../src/modules/blog-composition/modules/likes/types/like';
import { ViewLikeDetailsModel } from './viewLikeDetailsModel';

export type ViewExtendedLikesInfoModel = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatusType;
  newestLikes: ViewLikeDetailsModel[];
};
