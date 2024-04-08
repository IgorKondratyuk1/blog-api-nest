import { LikesInfoDto } from '../../../likes/models/output/likes-info.dto';
import { CommentatorInfoDto } from './commentator-info.dto';

export class ViewPublicCommentDto {
  constructor(
    public id: string,
    public content: string,
    public commentatorInfo: CommentatorInfoDto,
    public createdAt: string,
    public likesInfo: LikesInfoDto = new LikesInfoDto(),
  ) {}
}
