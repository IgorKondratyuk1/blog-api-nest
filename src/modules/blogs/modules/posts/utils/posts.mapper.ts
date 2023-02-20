import { Post, PostDocument } from '../schemas/post.schema';
import { ViewPostDto } from '../dto/view-post.dto';
import { ExtendedLikesInfo } from '../../likes/types/like';

export class PostsMapper {
  public static toView(
    post: Post | PostDocument,
    extendedLikesInfo: ExtendedLikesInfo,
  ) {
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
