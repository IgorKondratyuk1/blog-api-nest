import { LikesInfo } from '../../likes/dto/likes-info.dto';
import { CommentatorInfo } from '../schemas/commentator-info.schema';
import { ViewPostInfoDto } from '../../posts/models/output/view-post-info.dto';

export class ViewBloggerCommentDto {
  constructor(
    public id: string,
    public content: string,
    public commentatorInfo: CommentatorInfo, // TODO: maybe change to DTO
    public createdAt: string,
    public postInfo: ViewPostInfoDto,
    public likesInfo: LikesInfo = new LikesInfo(),
  ) {}
}
