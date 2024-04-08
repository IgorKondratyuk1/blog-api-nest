import { PostMongoEntity } from '../repository/mongoose/schemas/post.schema';
import { LikeStatus, LikeStatusType } from '../../likes/types/like';
import { ExtendedLikesInfo } from '../../likes/models/output/extended-likes-info.dto';
import { ViewPostDto } from '../models/output/view-post.dto';
import { PostEntity } from '../entities/post.entity';
import { DbPost } from '../repository/postgresql/types/post';
import { BlogMongoEntity } from '../../blogs/repository/mongoose/schemas/blog.schema';
import { LikeDetails } from '../../likes/models/output/like-details.dto';
import { LikeEntity } from '../../likes/entities/like.entity';
import { LikeMongoEntity } from '../../likes/repository/mongoose/schemas/like.schema';

export class PostMapper {
  public static toLikeDetails(like: LikeEntity | LikeMongoEntity): LikeDetails {
    return new LikeDetails(like.createdAt.toISOString(), like.userId, like.userLogin);
  }

  public static toView(
    post: PostMongoEntity | PostEntity,
    likeStatus: LikeStatusType = LikeStatus.None,
    likesCount = 0,
    dislikesCount = 0,
    lastLikes: LikeEntity[] | LikeMongoEntity[] = [],
  ) {
    const newestLikes: LikeDetails[] = lastLikes.map((like) => {
      return this.toLikeDetails(like);
    });

    const extendedLikesInfo: ExtendedLikesInfo = new ExtendedLikesInfo(
      likesCount,
      dislikesCount,
      likeStatus,
      newestLikes,
    );

    return new ViewPostDto(
      post.id,
      post.title,
      post.shortDescription,
      post.content,
      post.blogId,
      post.blogName,
      post.createdAt.toISOString(),
      extendedLikesInfo,
    );
  }

  public static toMongo(postEntity: PostEntity) {
    return new PostMongoEntity(
      postEntity.id,
      postEntity.userId,
      postEntity.title,
      postEntity.blogId,
      postEntity.shortDescription,
      postEntity.content,
      postEntity.blogName,
      postEntity.createdAt,
      postEntity.isBanned,
    );
  }

  public static toDomainFromMongo(postMongoEntity: PostMongoEntity): PostEntity {
    return new PostEntity(
      postMongoEntity.id,
      postMongoEntity.userId,
      postMongoEntity.blogName,
      postMongoEntity.blogId,
      postMongoEntity.shortDescription,
      postMongoEntity.content,
      postMongoEntity.title,
      postMongoEntity.createdAt,
      postMongoEntity.isBanned,
    );
  }
  public static toDomainFromPlainSql(dbPost: DbPost): PostEntity {
    return new PostEntity(
      dbPost.id,
      dbPost.userId,
      dbPost.blogName,
      dbPost.blogId,
      dbPost.shortDescription,
      dbPost.content,
      dbPost.title,
      dbPost.createdAt,
      dbPost.isBanned,
    );
  }
}
