import { LikesInfo } from '../../likes/dto/likes-info.dto';
import { CommentatorInfo } from '../schemas/commentator-info.schema';
import { ViewPostInfoDto } from '../../posts/dto/view-post-info.dto';

export class ViewBloggerCommentDto {
  constructor(
    public id: string,
    public content: string,
    public commentatorInfo: CommentatorInfo,
    public createdAt: string,
    public postInfo: ViewPostInfoDto,
    public likesInfo: LikesInfo = new LikesInfo(),
  ) {}
}
