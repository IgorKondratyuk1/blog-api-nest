import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostsQueryRepository } from '../../interfaces/posts.query-repository';
import { ViewPostDto } from '../../models/output/view-post.dto';
import { PostMapper } from '../../utils/postMapper';
import { QueryDto } from '../../../../../../common/dto/query.dto';
import { PaginationDto } from '../../../../../../common/dto/pagination';
import { DbPost } from './types/post';
import { PaginationHelper } from '../../../../../../common/utils/paginationHelper';
import { PostEntity } from '../../entities/post.entity';

@Injectable()
export class PostsPgQueryRepository extends PostsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super();
  }

  public async findOne(postId: string, currentUserId: string = null): Promise<ViewPostDto | null> {
    const findPostQuery =
      'SELECT pt.title as "title", pt.short_description as "shortDescription", pt.content as "content", ' +
      'pt.blog_id as "blogId", pt.user_id as "userId", pt.id as "id", pt.created_at as "createdAt", pt.is_banned as "isBanned", ' +
      'bt.name as "blogName" ' +
      'FROM public.post pt ' +
      'LEFT JOIN public.blog bt ON pt.blog_id = bt.id ' +
      'WHERE pt.id=$1 AND pt.is_banned = FALSE;';

    const result: DbPost[] = await this.dataSource.query(findPostQuery, [postId]);
    if (result.length === 0) return null;

    const dbPost = result[0];

    console.log('dbPost');
    console.log(dbPost);

    return PostMapper.toView(PostMapper.toDomainFromPlainSql(dbPost));
  }

  public async findAll(queryObj: QueryDto, currentUserId: string = null): Promise<PaginationDto<ViewPostDto>> {
    console.log(queryObj);
    const skipValue: number = PaginationHelper.getSkipValue(queryObj.pageNumber, queryObj.pageSize);
    const sortValue: string = queryObj.sortDirection.toUpperCase();
    const filters = this.getFilters(queryObj, true);

    const queryTotalCount = `SELECT count(*) FROM public.post pt LEFT JOIN public.blog bt ON pt.blog_id = bt.id ${filters};`;
    console.log(queryTotalCount);
    const resultTotalCount = await this.dataSource.query(queryTotalCount);
    const totalCount = Number(resultTotalCount[0].count);
    const pagesCount = PaginationHelper.getPagesCount(totalCount, queryObj.pageSize);

    const foundedPosts: DbPost[] = await this.findPostByFilters(filters, queryObj, sortValue, skipValue);
    const postEntities: PostEntity[] = foundedPosts.map(PostMapper.toDomainFromPlainSql);
    const postViewModels: ViewPostDto[] = postEntities.map((postEntity) => PostMapper.toView(postEntity));

    return new PaginationDto<ViewPostDto>(
      pagesCount,
      Number(queryObj.pageNumber),
      Number(queryObj.pageSize),
      totalCount,
      postViewModels,
    );
  }

  async findPostsOfBlog(
    blogId: string,
    queryObj: QueryDto,
    currentUserId: string = null,
  ): Promise<PaginationDto<ViewPostDto>> {
    const skipValue: number = PaginationHelper.getSkipValue(queryObj.pageNumber, queryObj.pageSize);
    const sortValue: string = queryObj.sortDirection.toUpperCase();
    const filters = this.getFilters(queryObj, true, ['pt.blog_id=$1', 'pt.is_banned = FALSE']);

    const queryTotalCount = `SELECT count(*) FROM public.post pt LEFT JOIN public.blog bt ON pt.blog_id = bt.id ${filters};`;
    const resultTotalCount = await this.dataSource.query(queryTotalCount, [blogId]);

    const totalCount = Number(resultTotalCount[0].count);
    const pagesCount = PaginationHelper.getPagesCount(totalCount, queryObj.pageSize);

    let findPostQuery =
      'SELECT pt.title as "title", pt.short_description as "shortDescription", pt.content as "content", ' +
      'pt.blog_id as "blogId", pt.user_id as "userId", pt.id as "id", pt.created_at as "createdAt", pt.is_banned as "isBanned", ' +
      'bt.name as "blogName" ' +
      'FROM public."post" pt ' +
      'LEFT JOIN public."blog" bt ON pt.blog_id = bt.id ';
    findPostQuery += filters;
    findPostQuery += ` ORDER BY "${queryObj.sortBy}" ${sortValue}`;
    findPostQuery += ' LIMIT $2 ';
    findPostQuery += ' OFFSET $3;';
    console.log(findPostQuery);
    const foundedPosts: DbPost[] = await this.dataSource.query(findPostQuery, [blogId, queryObj.pageSize, skipValue]);
    const postEntities: PostEntity[] = foundedPosts.map(PostMapper.toDomainFromPlainSql);
    const postViewModels: ViewPostDto[] = postEntities.map((postEntity) => PostMapper.toView(postEntity));

    return new PaginationDto<ViewPostDto>(
      pagesCount,
      Number(queryObj.pageNumber),
      Number(queryObj.pageSize),
      totalCount,
      postViewModels,
    );
  }

  async findPostsOfBlogByUserId(
    blogId: string,
    queryObj: QueryDto,
    userId: string,
  ): Promise<PaginationDto<ViewPostDto>> {
    console.log(queryObj);
    const skipValue: number = PaginationHelper.getSkipValue(queryObj.pageNumber, queryObj.pageSize);
    const sortValue: string = queryObj.sortDirection.toUpperCase();
    const filters = this.getFilters(queryObj, true, ['pt.blog_id=$1', 'pt.user_id=$2', 'pt.is_banned=FALSE']);

    const queryTotalCount = `SELECT count(*) FROM public.post pt LEFT JOIN public.blog bt ON pt.blog_id = bt.id ${filters};`;
    const resultTotalCount = await this.dataSource.query(queryTotalCount, [blogId, userId]);

    const totalCount = Number(resultTotalCount[0].count);
    const pagesCount = PaginationHelper.getPagesCount(totalCount, queryObj.pageSize);

    let findPostQuery =
      'SELECT pt.title as "title", pt.short_description as "shortDescription", pt.content as "content", ' +
      'pt.blog_id as "blogId", pt.user_id as "userId", pt.id as "id", pt.created_at as "createdAt", pt.is_banned as "isBanned", ' +
      'bt.name as "blogName" ' +
      'FROM public.post pt ' +
      'LEFT JOIN public.blog bt ON pt.blog_id = bt.id ';
    findPostQuery += filters;
    findPostQuery += ` ORDER BY "${queryObj.sortBy}" ${sortValue}`;
    findPostQuery += ' LIMIT $3 ';
    findPostQuery += ' OFFSET $4;';

    const foundedPosts: DbPost[] = await this.dataSource.query(findPostQuery, [
      blogId,
      userId,
      queryObj.pageSize,
      skipValue,
    ]);
    const postEntities: PostEntity[] = foundedPosts.map(PostMapper.toDomainFromPlainSql);
    const postViewModels: ViewPostDto[] = postEntities.map((postEntity) => PostMapper.toView(postEntity));

    return new PaginationDto<ViewPostDto>(
      pagesCount,
      Number(queryObj.pageNumber),
      Number(queryObj.pageSize),
      totalCount,
      postViewModels,
    );
  }

  protected async findPostByFilters(filters, queryObj, sortValue, skipValue): Promise<DbPost[]> {
    let query =
      'SELECT pt.title as "title", pt.short_description as "shortDescription", pt.content as "content", ' +
      'pt.blog_id as "blogId", pt.user_id as "userId", pt.id as "id", pt.created_at as "createdAt", pt.is_banned as "isBanned", ' +
      'bt.name as "blogName" ' +
      'FROM public.post pt ' +
      'LEFT JOIN public.blog bt ON pt.blog_id = bt.id ';

    query += filters;
    query += ` ORDER BY "${queryObj.sortBy}" ${sortValue}`;
    query += ' LIMIT $1 ';
    query += ' OFFSET $2;';

    console.log(query);
    return await this.dataSource.query(query, [queryObj.pageSize, skipValue]);
  }

  getFilters = (queryObj: QueryDto, skipBannedPosts: boolean, additionalFilters: string[] = []): string => {
    const sqlFilters = [];

    // TODO: change pt.is_banned
    if (skipBannedPosts) {
      sqlFilters.push('pt.is_banned = FALSE');
    }

    if (queryObj.searchNameTerm) {
      sqlFilters.push(`name ILIKE '%${queryObj.searchNameTerm}%'`);
    }

    if (additionalFilters.length > 0) {
      sqlFilters.push(...additionalFilters);
    }

    if (sqlFilters.length > 0) {
      return 'WHERE ' + sqlFilters.join(' AND ');
    }

    return '';
  };
}
