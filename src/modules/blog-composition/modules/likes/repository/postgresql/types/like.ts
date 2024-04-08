import { LikeStatusType } from '../../../types/like';

export type DbLike = {
  id: string;
  userId: string;
  userLogin: string;
  locationId: string;
  status: LikeStatusType;
  createdAt: Date;
};
