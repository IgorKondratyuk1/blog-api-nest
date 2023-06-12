import { ViewLikeModel } from '../like/viewLikeModel';

export type ComentatorInfoType = {
  userId: string;
  userLogin: string;
};

export type ViewCommentModel = {
  id: string;
  content: string;
  createdAt: string;
  likesInfo: ViewLikeModel;
  commentatorInfo: ComentatorInfoType;
};
