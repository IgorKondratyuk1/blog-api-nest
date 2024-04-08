import { LikesInfoDto } from '../../../likes/models/output/likes-info.dto';
import { ViewPostInfoDto } from '../../../posts/models/output/view-post-info.dto';
import { CommentatorInfoDto } from './commentator-info.dto';

export class ViewBloggerCommentDto {
  constructor(
    public id: string,
    public content: string,
    public commentatorInfo: CommentatorInfoDto,
    public createdAt: string,
    public postInfo: ViewPostInfoDto,
    public likesInfo: LikesInfoDto = new LikesInfoDto(),
  ) {}
}
