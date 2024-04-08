import { CommentMongoEntity } from '../repository/mongoose/schemas/comment.schema';
import { ViewPublicCommentDto } from '../models/output/view-public-comment.dto';
import { LikeStatus, LikeStatusType } from '../../likes/types/like';
import { LikesInfoDto } from '../../likes/models/output/likes-info.dto';
import { ViewBloggerCommentDto } from '../models/output/view-blogger-comment.dto';
import { PostDocument } from '../../posts/repository/mongoose/schemas/post.schema';
import { ViewPostInfoDto } from '../../posts/models/output/view-post-info.dto';
import { PostEntity } from '../../posts/entities/post.entity';
import { CommentEntity } from '../entities/comment.entity';
import { CommentatorInfoEntity } from '../entities/commentator-info.entity';
import { DbComment } from '../repository/postgresql/types/comment';
import { CommentatorInfoDto } from '../models/output/commentator-info.dto';

export class CommentsMapper {
  public static toPublicViewFromDomain(
    comment: CommentEntity | CommentMongoEntity,
    likeStatus: LikeStatusType = LikeStatus.None,
    likesCount = 0,
    dislikesCount = 0,
  ) {
    const likeInfo = new LikesInfoDto(likesCount, dislikesCount, likeStatus);

    return new ViewPublicCommentDto(
      comment.id,
      comment.content,
      new CommentatorInfoDto(comment.commentatorInfo.userId, comment.commentatorInfo.userLogin),
      comment.createdAt.toISOString(),
      likeInfo,
    );
  }

  public static toPublicViewFromPlainSql(
    dbComment: DbComment,
    likeStatus: LikeStatusType = LikeStatus.None,
    likesCount = 0,
    dislikesCount = 0,
  ) {
    const likeInfo = new LikesInfoDto(likesCount, dislikesCount, likeStatus);

    return new ViewPublicCommentDto(
      dbComment.id,
      dbComment.content,
      new CommentatorInfoDto(dbComment.userId, dbComment.userLogin),
      dbComment.createdAt.toISOString(),
      likeInfo,
    );
  }

  public static toBloggerViewFromDomain(
    comment: CommentEntity | CommentMongoEntity,
    post: PostDocument | PostEntity,
    likeStatus: LikeStatusType = LikeStatus.None,
    likesCount = 0,
    dislikesCount = 0,
  ) {
    const postInfoDto: ViewPostInfoDto = new ViewPostInfoDto(post.id, post.title, post.blogId, post.blogName);
    const likeInfo = new LikesInfoDto(likesCount, dislikesCount, likeStatus);

    return new ViewBloggerCommentDto(
      comment.id,
      comment.content,
      new CommentatorInfoDto(comment.commentatorInfo.userId, comment.commentatorInfo.userLogin),
      comment.createdAt.toISOString(),
      postInfoDto,
      likeInfo,
    );
  }

  public static toBloggerViewFromPlainSql(
    comment: DbComment,
    post: PostDocument | PostEntity,
    likeStatus: LikeStatusType = LikeStatus.None,
    likesCount = 0,
    dislikesCount = 0,
  ) {
    const postInfoDto: ViewPostInfoDto = new ViewPostInfoDto(post.id, post.title, post.blogId, post.blogName);
    const likeInfo = new LikesInfoDto(likesCount, dislikesCount, likeStatus);

    return new ViewBloggerCommentDto(
      comment.id,
      comment.content,
      new CommentatorInfoDto(comment.userId, comment.userLogin),
      comment.createdAt.toISOString(),
      postInfoDto,
      likeInfo,
    );
  }

  public static toMongo(commentEntity: CommentEntity): CommentMongoEntity {
    return new CommentMongoEntity(
      commentEntity.id,
      commentEntity.createdAt,
      commentEntity.content,
      new CommentatorInfoEntity(commentEntity.commentatorInfo.userId, commentEntity.commentatorInfo.userLogin),
      commentEntity.postId,
      commentEntity.blogId,
      commentEntity.isBanned,
    );
  }

  public static toDomainFromMongo(commentMongoEntity: CommentMongoEntity): CommentEntity {
    return new CommentEntity(
      commentMongoEntity.id,
      commentMongoEntity.createdAt,
      commentMongoEntity.content,
      new CommentatorInfoEntity(
        commentMongoEntity.commentatorInfo.userId,
        commentMongoEntity.commentatorInfo.userLogin,
      ),
      commentMongoEntity.postId,
      commentMongoEntity.blogId,
      commentMongoEntity.isBanned,
    );
  }

  public static toDomainFromPlainSql(dbComment: DbComment): CommentEntity {
    return new CommentEntity(
      dbComment.id,
      dbComment.createdAt,
      dbComment.content,
      new CommentatorInfoEntity(dbComment.userId, dbComment.userLogin),
      dbComment.postId,
      dbComment.blogId,
      false,
    );
  }
}
