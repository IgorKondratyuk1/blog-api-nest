import { ViewBlogDto } from '../models/output/view-blog.dto';
import { QueryDto } from '../../../../../common/dto/query.dto';
import { PaginationDto } from '../../../../../common/dto/pagination';
import { ViewExtendedBlogDto } from '../models/output/view-extended-blog.dto';

export abstract class BlogsQueryRepository {
  public abstract findOne(id: string): Promise<ViewBlogDto | null>;
  public abstract findAll(queryObj: QueryDto, skipBannedBlogs: boolean): Promise<PaginationDto<ViewBlogDto>>;
  public abstract findBlogsWithExtendedInfo(queryObj: QueryDto): Promise<PaginationDto<ViewExtendedBlogDto>>;
  public abstract findBlogsByCreatedUserId(userId: string, queryObj: QueryDto): Promise<PaginationDto<ViewBlogDto>>;
  protected abstract findBlogByFilters(filters, queryObj, sortValue, skipValue): Promise<any[]>;
}
