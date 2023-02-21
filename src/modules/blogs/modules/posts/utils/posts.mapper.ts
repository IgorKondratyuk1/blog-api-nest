import { Post, PostDocument } from '../schemas/post.schema';
import { ViewPostDto } from '../dto/view-post.dto';
import { ExtendedLikesInfo } from '../../likes/types/like';
import { ViewLimitedPostDto } from '../dto/view-limited-post.dto';

export class PostsMapper {
  public static toView(post: Post | PostDocument, extendedLikesInfo: ExtendedLikesInfo) {
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

  public static toLimitedView(post: Post | PostDocument) {
    return new ViewLimitedPostDto(
      post.id,
      post.title,
      post.shortDescription,
      post.content,
      post.blogId,
      post.blogName,
      post.createdAt.toISOString(),
    );
  }
}
