import { QueryDto } from '../../../../../common/dto/query.dto';
import { PaginationDto } from '../../../../../common/dto/pagination';
import { ViewPublicCommentDto } from '../models/output/view-public-comment.dto';
import { ViewBloggerCommentDto } from '../models/output/view-blogger-comment.dto';

export abstract class CommentsQueryRepository {
  public abstract findById(commentId: string, currentUserId: string | null): Promise<ViewPublicCommentDto | null>;

  public abstract findCommentsOfPost(
    postId: string,
    queryObj: QueryDto,
    currentUserId: string | null,
  ): Promise<PaginationDto<ViewPublicCommentDto>>;

  public abstract findAllCommentsOfUserBlogs(
    userId: string,
    queryObj: QueryDto,
  ): Promise<PaginationDto<ViewBloggerCommentDto>>;
}
