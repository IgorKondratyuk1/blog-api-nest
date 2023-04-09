import { LikesInfo } from '../../likes/dto/likes-info.dto';
import { CommentatorInfo } from '../schemas/commentator-info.schema';

export class ViewCommentDto {
  constructor(
    public id: string,
    public content: string,
    public commentatorInfo: CommentatorInfo,
    public createdAt: string,
    public likesInfo: LikesInfo = new LikesInfo(),
  ) {}
}
