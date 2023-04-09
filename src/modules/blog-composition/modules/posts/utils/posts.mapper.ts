import { Post, PostDocument } from '../schemas/post.schema';
import { ViewPostDto } from '../dto/view-post.dto';
import { LikeStatus, LikeStatusType } from '../../likes/types/like';
import { ExtendedLikesInfo } from '../../likes/dto/extended-likes-info.dto';
import { Like } from '../../likes/schemas/like.schema';
import { LikeDetails } from '../../likes/dto/like-details.sto';

export class PostsMapper {
  public static toLikeDetails(like: Like): LikeDetails {
    return new LikeDetails(like.createdAt.toISOString(), like.userId, like.userLogin);
  }

  public static toView(
    post: Post | PostDocument,
    likeStatus: LikeStatusType = LikeStatus.None,
    likesCount = 0,
    dislikesCount = 0,
    lastLikes: Like[] = [],
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
}
