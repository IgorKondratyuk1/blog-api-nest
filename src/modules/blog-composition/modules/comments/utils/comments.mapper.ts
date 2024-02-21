import { Comment, CommentDocument } from '../schemas/comment.schema';
import { ViewPublicCommentDto } from '../dto/view-public-comment.dto';
import { LikeStatus, LikeStatusType } from '../../likes/types/like';
import { LikesInfo } from '../../likes/dto/likes-info.dto';
import { ViewBloggerCommentDto } from '../dto/view-blogger-comment.dto';
import { PostDocument } from '../../posts/repository/mongoose/schemas/post.schema';
import { ViewPostInfoDto } from '../../posts/models/output/view-post-info.dto';
import { PostEntity } from '../../posts/entities/post.entity';

export class CommentsMapper {
  public static toPublicView(
    comment: Comment | CommentDocument,
    likeStatus: LikeStatusType = LikeStatus.None,
    likesCount = 0,
    dislikesCount = 0,
  ) {
    const likeInfo = new LikesInfo(likesCount, dislikesCount, likeStatus);

    return new ViewPublicCommentDto(
      comment.id,
      comment.content,
      comment.commentatorInfo,
      comment.createdAt.toISOString(),
      likeInfo,
    );
  }

  public static toBloggerView(
    comment: Comment | CommentDocument,
    post: PostDocument | PostEntity,
    likeStatus: LikeStatusType = LikeStatus.None,
    likesCount = 0,
    dislikesCount = 0,
  ) {
    const postInfoDto: ViewPostInfoDto = new ViewPostInfoDto(post.id, post.title, post.blogId, post.blogName);
    const likeInfo = new LikesInfo(likesCount, dislikesCount, likeStatus);

    return new ViewBloggerCommentDto(
      comment.id,
      comment.content,
      comment.commentatorInfo,
      comment.createdAt.toISOString(),
      postInfoDto,
      likeInfo,
    );
  }
}
