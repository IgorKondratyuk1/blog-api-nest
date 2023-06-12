import { CommentatorInfo } from '../schemas/commentator-info.schema';
import { LikesInfo } from '../../likes/dto/likes-info.dto';

export class ViewPublicCommentDto {
  constructor(
    public id: string,
    public content: string,
    public commentatorInfo: CommentatorInfo,
    public createdAt: string,
    public likesInfo: LikesInfo = new LikesInfo(),
  ) {}
}
