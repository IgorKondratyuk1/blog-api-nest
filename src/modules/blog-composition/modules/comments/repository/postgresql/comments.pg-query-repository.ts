import { Injectable } from '@nestjs/common';
import { LikeLocation, LikeStatusType } from '../../../likes/types/like';
import { CommentsMapper } from '../../utils/comments.mapper';
import { ViewPublicCommentDto } from '../../models/output/view-public-comment.dto';
import { QueryDto } from '../../../../../../common/dto/query.dto';
import { PaginationHelper } from '../../../../../../common/utils/paginationHelper';
import { PaginationDto } from '../../../../../../common/dto/pagination';
import { LikesDislikesCountDto } from '../../../likes/models/output/likes-dislikes-count.dto';
import { ViewBloggerCommentDto } from '../../models/output/view-blogger-comment.dto';
import { PostEntity } from '../../../posts/entities/post.entity';
import { BlogEntity } from '../../../blogs/entities/blog.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommentsQueryRepository } from '../../interfaces/comments.query-repository';
import { DbComment } from './types/comment';
import { LikesPgRepository } from '../../../likes/repository/postgresql/likes.pg-repository';
import { BlogsPgRepository } from '../../../blogs/repository/postgresql/blogs.pg-repository';
import { PostsPgRepository } from '../../../posts/repository/postgresql/posts.pg-repository';
import { LikesRepository } from '../../../likes/interfaces/likes.repository';
import { BlogsRepository } from '../../../blogs/interfaces/blogs.repository';
import { PostsRepository } from '../../../posts/interfaces/posts.repository';

@Injectable()
export class CommentsPgQueryRepository extends CommentsQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private likesRepository: LikesRepository,
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) {
    super();
  }

  public async findById(commentId: string, currentUserId: string = null): Promise<ViewPublicCommentDto | null> {
    const findCommentQuery =
      'SELECT ct.created_at as "createdAt", ct.content as "content", ct.post_id as "postId", pt.blog_id as "blogId", ' +
      'ct.user_id as "userId", acc.login as "userLogin", ct.id as "id", ct.is_banned as "isBanned" ' +
      'FROM public.comment ct ' +
      'LEFT JOIN public."user" u ON u.id = ct.user_id ' +
      'LEFT JOIN public."account" acc ON acc.id = u.account_id ' +
      'LEFT JOIN public."post" pt ON pt.id = ct.post_id ' +
      'WHERE ct.id=$1 AND ct.is_banned=FALSE;';

    const result: DbComment[] = await this.dataSource.query(findCommentQuery, [commentId]);
    if (result.length === 0) return null;

    const dbComment: DbComment = result[0];

    const likeStatus: LikeStatusType = await this.likesRepository.getUserLikeStatus(
      currentUserId,
      commentId,
      LikeLocation.Comment,
    );

    const likesDislikesCount: LikesDislikesCountDto = await this.likesRepository.getLikesAndDislikesCount(
      commentId,
      LikeLocation.Comment,
    );

    return CommentsMapper.toPublicViewFromPlainSql(
      dbComment,
      likeStatus,
      likesDislikesCount.likesCount,
      likesDislikesCount.dislikesCount,
    );
  }

  public async findCommentsOfPost(
    postId: string,
    queryObj: QueryDto,
    currentUserId: string = null,
  ): Promise<PaginationDto<ViewPublicCommentDto>> {
    const skipValue: number = PaginationHelper.getSkipValue(queryObj.pageNumber, queryObj.pageSize);
    const sortValue: string = queryObj.sortDirection.toUpperCase();
    const filters = this.getFilters(queryObj, true, currentUserId, null, postId);

    const queryTotalCount =
      'SELECT count(*) FROM public.comment ct ' +
      'LEFT JOIN public."user" u ON u.id = ct.user_id ' +
      'LEFT JOIN public."account" acc ON acc.id = u.account_id ' +
      `LEFT JOIN public."post" pt ON pt.id = ct.post_id ${filters}`;
    console.log(queryTotalCount);
    const resultTotalCount = await this.dataSource.query(queryTotalCount);
    const totalCount = Number(resultTotalCount[0].count);
    const pagesCount = PaginationHelper.getPagesCount(totalCount, queryObj.pageSize);

    const foundedComments: DbComment[] = await this.findCommentsByFilters(filters, queryObj, sortValue, skipValue);
    const commentsViewModels: ViewPublicCommentDto[] = await Promise.all(
      foundedComments.map(async (comment: DbComment) => {
        const likeStatus: LikeStatusType = await this.likesRepository.getUserLikeStatus(
          currentUserId,
          comment.id,
          LikeLocation.Comment,
        );

        const likesDislikesCount: LikesDislikesCountDto = await this.likesRepository.getLikesAndDislikesCount(
          comment.id,
          LikeLocation.Comment,
        );

        return CommentsMapper.toPublicViewFromPlainSql(
          comment,
          likeStatus,
          likesDislikesCount.likesCount,
          likesDislikesCount.dislikesCount,
        );
      }),
    );

    return new PaginationDto<ViewPublicCommentDto>(
      pagesCount,
      Number(queryObj.pageNumber),
      Number(queryObj.pageSize),
      totalCount,
      commentsViewModels,
    );
  }

  public async findAllCommentsOfUserBlogs(
    userId: string,
    queryObj: QueryDto,
  ): Promise<PaginationDto<ViewBloggerCommentDto>> {
    const skipValue: number = PaginationHelper.getSkipValue(queryObj.pageNumber, queryObj.pageSize);
    const sortValue: string = queryObj.sortDirection.toUpperCase();

    const userBlogs: BlogEntity[] = await this.blogsRepository.findByUserId(userId);
    const blogIds = userBlogs.map((blog) => blog.id);

    const filters = this.getFilters(queryObj, true, null, blogIds);
    const foundedComments: DbComment[] = await this.findCommentsByBlogAndFilters(
      filters,
      queryObj,
      sortValue,
      skipValue,
    );

    const commentsViewModels: ViewBloggerCommentDto[] = await Promise.all(
      foundedComments.map(async (comment) => {
        const likeStatus: LikeStatusType = await this.likesRepository.getUserLikeStatus(
          userId,
          comment.id,
          LikeLocation.Comment,
        );

        const likesDislikesCount: LikesDislikesCountDto = await this.likesRepository.getLikesAndDislikesCount(
          comment.id,
          LikeLocation.Comment,
        );

        const post: PostEntity | null = await this.postsRepository.findById(comment.postId);
        return CommentsMapper.toBloggerViewFromPlainSql(
          comment,
          post,
          likeStatus,
          likesDislikesCount.likesCount,
          likesDislikesCount.dislikesCount,
        );
      }),
    );

    const queryTotalCount = `SELECT count(*) FROM public.comment ${filters};`;
    console.log(queryTotalCount);
    const resultTotalCount = await this.dataSource.query(queryTotalCount);
    const totalCount = Number(resultTotalCount[0].count);
    const pagesCount = PaginationHelper.getPagesCount(totalCount, queryObj.pageSize);

    return new PaginationDto<ViewBloggerCommentDto>(
      pagesCount,
      Number(queryObj.pageNumber),
      Number(queryObj.pageSize),
      totalCount,
      commentsViewModels,
    );
  }

  protected async findCommentsByFilters(filters, queryObj, sortValue, skipValue): Promise<DbComment[]> {
    let query =
      'SELECT ct.created_at as "createdAt", ct.content as "content", ct.post_id as "postId", pt.blog_id as "blogId", ' +
      'ct.user_id as "userId", acc.login as "userLogin", ct.id as "id", ct.is_banned as "isBanned" ' +
      'FROM public.comment ct ' +
      'LEFT JOIN public."user" u ON u.id = ct.user_id ' +
      'LEFT JOIN public."account" acc ON acc.id = u.account_id ' +
      'LEFT JOIN public."post" pt ON pt.id = ct.post_id ';

    query += filters;
    query += ` ORDER BY "${queryObj.sortBy}" ${sortValue}`;
    query += ' LIMIT $1 ';
    query += ' OFFSET $2;';

    console.log(query);
    return await this.dataSource.query(query, [queryObj.pageSize, skipValue]);
  }

  protected async findCommentsByBlogAndFilters(filters, queryObj, sortValue, skipValue): Promise<DbComment[]> {
    let query =
      'SELECT ct.created_at as "createdAt", ct.content as "content", ct.post_id as "postId", pt.blog_id as "blogId", ' +
      'ct.user_id as "userId", acc.login as "userLogin", ct.id as "id", ct.is_banned as "isBanned" ' +
      'FROM public.comment ct ' +
      'LEFT JOIN public."user" u ON u.id = ct.user_id ' +
      'LEFT JOIN public."account" acc ON acc.id = u.account_id ' +
      'LEFT JOIN public."post" pt ON pt.id = ct.post_id ' +
      'LEFT JOIN public."blog" bt ON bt.id = pt.blog_id ';

    query += filters;
    query += ` ORDER BY "${queryObj.sortBy}" ${sortValue}`;
    query += ' LIMIT $1 ';
    query += ' OFFSET $2;';

    console.log(query);
    return await this.dataSource.query(query, [queryObj.pageSize, skipValue]);
  }

  protected getFilters(
    queryObj: QueryDto,
    skipBannedComments: boolean,
    userId: string | null = null,
    blogIds: string[] | null = null,
    postId: string | null = null,
  ): string {
    const sqlFilters = [];

    // TODO: change "ct.is_banned" to another variant
    if (skipBannedComments) {
      sqlFilters.push('ct.is_banned=FALSE');
    }

    if (userId) {
      sqlFilters.push(`ct.user_id = '${userId}'`);
    }

    if (blogIds && blogIds.length > 0) {
      sqlFilters.push(`bt.id IN (${blogIds.join(',')})`);
    }

    if (queryObj.searchNameTerm) {
      sqlFilters.push(`name ILIKE '%${queryObj.searchNameTerm}%'`);
    }

    if (postId) {
      sqlFilters.push(`pt.id = '${postId}'`);
    }

    if (sqlFilters.length > 0) {
      return 'WHERE ' + sqlFilters.join(' AND ');
    }

    return '';
  }
}
