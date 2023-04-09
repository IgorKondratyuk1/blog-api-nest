import { Comment, CommentDocument } from '../schemas/comment.schema';
import { ViewCommentDto } from '../dto/view-comment.dto';
import { LikeStatus, LikeStatusType } from '../../likes/types/like';
import { LikesInfo } from '../../likes/dto/likes-info.dto';

export class CommentsMapper {
  public static toView(
    comment: Comment | CommentDocument,
    likeStatus: LikeStatusType = LikeStatus.None,
    likesCount = 0,
    dislikesCount = 0,
  ) {
    const likeInfo = new LikesInfo(likesCount, dislikesCount, likeStatus);

    return new ViewCommentDto(
      comment.id,
      comment.content,
      comment.commentatorInfo,
      comment.createdAt.toISOString(),
      likeInfo,
    );
  }
}
