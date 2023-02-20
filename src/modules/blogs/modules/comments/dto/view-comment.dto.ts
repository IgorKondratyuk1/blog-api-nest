import { LikesInfo } from '../../likes/types/like';
import { CommentatorInfo } from '../schemas/commentatorInfo.schema';

export class ViewCommentDto {
  constructor(
    public id: string,
    public content: string,
    public commentatorInfo: CommentatorInfo,
    public createdAt: string,
    public likesInfo: LikesInfo = new LikesInfo(),
  ) {}
}
