import { Comment, CommentDocument } from '../schemas/comment.schema';
import { ViewCommentDto } from '../dto/view-comment.dto';

export class CommentsMapper {
  public static toView(comment: Comment | CommentDocument) {
    return new ViewCommentDto(
      comment.id,
      comment.content,
      comment.commentatorInfo,
      comment.createdAt.toISOString(),
    );
  }
}
