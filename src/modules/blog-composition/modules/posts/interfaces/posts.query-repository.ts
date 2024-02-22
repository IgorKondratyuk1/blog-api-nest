import { QueryDto } from '../../../../../common/dto/query.dto';
import { PaginationDto } from '../../../../../common/dto/pagination';
import { ViewPostDto } from '../models/output/view-post.dto';
import { PostMongoEntity } from '../repository/mongoose/schemas/post.schema';

export abstract class PostsQueryRepository {
  public abstract findOne(postId: string, currentUserId: string): Promise<ViewPostDto | null>;

  public abstract findAll(queryObj: QueryDto, currentUserId: string): Promise<PaginationDto<ViewPostDto>>;

  public abstract findPostsOfBlog(
    blogId: string,
    queryObj: QueryDto,
    currentUserId?: string,
  ): Promise<PaginationDto<ViewPostDto>>;

  public abstract findPostsOfBlogByUserId(
    blogId: string,
    queryObj: QueryDto,
    userId: string,
  ): Promise<PaginationDto<ViewPostDto>>;

  protected abstract findPostByFilters(filters, queryObj, sortValue, skipValue): Promise<PostMongoEntity[]>;
}
