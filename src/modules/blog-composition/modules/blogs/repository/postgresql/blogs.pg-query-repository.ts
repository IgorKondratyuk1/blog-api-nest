import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogsQueryRepository } from '../../interfaces/blogs.query-repository';
import { ViewBlogDto } from '../../models/output/view-blog.dto';
import { BlogMapper } from '../../utils/blogs.mapper';
import { DbBlog, DbBlogExtended } from './types/blog';
import { QueryDto } from '../../../../../../common/dto/query.dto';
import { PaginationDto } from '../../../../../../common/dto/pagination';
import { PaginationHelper } from '../../../../../../common/utils/paginationHelper';
import { BlogEntity } from '../../entities/blog.entity';
import { ViewExtendedBlogDto } from '../../models/output/view-extended-blog.dto';

@Injectable()
export class BlogsPgQueryRepository extends BlogsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super();
  }

  async findOne(id: string): Promise<ViewBlogDto | null> {
    const findBlogQuery =
      'SELECT b.id as "id", b.name as "name", b.description as "description", b.website_url as "websiteUrl", ' +
      'b.is_membership as "isMembership", b.created_at as "createdAt", b.user_id as "userId", ' +
      'sb.ban_date as "banDate", sb.id as "banId" ' +
      'FROM public.blog b ' +
      'LEFT JOIN public."sa_blog_ban" sb ON b.id = sb.blog_id ' +
      'WHERE b.id = $1 AND sb.id IS NULL;';

    const result: DbBlog[] = await this.dataSource.query(findBlogQuery, [id]);
    if (result.length === 0) return null;

    const dbBlog = result[0];

    console.log('dbBlog');
    console.log(dbBlog);

    return BlogMapper.toView(BlogMapper.toDomainFromPlainSql(dbBlog));
  }

  async findAll(queryObj: QueryDto, skipBannedBlogs: boolean): Promise<PaginationDto<ViewBlogDto>> {
    console.log(queryObj);
    const skipValue: number = PaginationHelper.getSkipValue(queryObj.pageNumber, queryObj.pageSize);
    const sortValue: string = queryObj.sortDirection.toUpperCase();
    const filters = this.getFilters(queryObj, skipBannedBlogs);

    const queryTotalCount = `SELECT count(*) FROM public."blog" b LEFT JOIN public."sa_blog_ban" sb ON b.id = sb.blog_id ${filters};`;
    console.log(queryTotalCount);
    const resultTotalCount = await this.dataSource.query(queryTotalCount);
    const totalCount = Number(resultTotalCount[0].count);
    const pagesCount = PaginationHelper.getPagesCount(totalCount, queryObj.pageSize);

    const foundedBlogs: DbBlog[] = await this.findBlogByFilters(filters, queryObj, sortValue, skipValue);
    const blogEntities: BlogEntity[] = foundedBlogs.map(BlogMapper.toDomainFromPlainSql);
    const blogsViewModels: ViewBlogDto[] = blogEntities.map(BlogMapper.toView);

    return new PaginationDto<ViewBlogDto>(
      pagesCount,
      Number(queryObj.pageNumber),
      Number(queryObj.pageSize),
      totalCount,
      blogsViewModels,
    );
  }

  // Only for SA
  async findBlogsWithExtendedInfo(queryObj: QueryDto): Promise<PaginationDto<ViewExtendedBlogDto>> {
    console.log(queryObj);
    const skipValue: number = PaginationHelper.getSkipValue(queryObj.pageNumber, queryObj.pageSize);
    const sortValue: string = queryObj.sortDirection.toUpperCase();
    const filters = this.getFilters(queryObj, false);

    const queryTotalCount = `SELECT count(*) FROM public."blog" b LEFT JOIN public."sa_blog_ban" sb ON b.id = sb.blog_id ${filters};`;
    console.log(queryTotalCount);
    const resultTotalCount = await this.dataSource.query(queryTotalCount);
    const totalCount = Number(resultTotalCount[0].count);
    const pagesCount = PaginationHelper.getPagesCount(totalCount, queryObj.pageSize);

    const foundedBlogs: DbBlogExtended[] = await this.findExtendedBlogByFilters(
      filters,
      queryObj,
      sortValue,
      skipValue,
    );
    const blogsViewModels: ViewExtendedBlogDto[] = foundedBlogs.map(BlogMapper.toExtendedViewFromPlainSql);

    return new PaginationDto<ViewExtendedBlogDto>(
      pagesCount,
      Number(queryObj.pageNumber),
      Number(queryObj.pageSize),
      totalCount,
      blogsViewModels,
    );
  }

  // Only for Blogger
  public async findBlogsByCreatedUserId(userId: string, queryObj: QueryDto): Promise<PaginationDto<ViewBlogDto>> {
    console.log(queryObj);
    const skipValue: number = PaginationHelper.getSkipValue(queryObj.pageNumber, queryObj.pageSize);
    const sortValue: string = queryObj.sortDirection.toUpperCase();
    const filters = this.getFilters(queryObj, false, userId);

    const queryTotalCount = `SELECT count(*) FROM public."blog" b LEFT JOIN public."sa_blog_ban" sb ON b.id = sb.blog_id ${filters};`;
    const resultTotalCount = await this.dataSource.query(queryTotalCount);
    const totalCount = Number(resultTotalCount[0].count);
    const pagesCount = PaginationHelper.getPagesCount(totalCount, queryObj.pageSize);

    const foundedBlogs: DbBlog[] = await this.findBlogByFilters(filters, queryObj, sortValue, skipValue);
    console.log('findBlogsByCreatedUserId');
    console.log(foundedBlogs);
    const blogsViewModels: ViewBlogDto[] = foundedBlogs.map(BlogMapper.toDomainFromPlainSql).map(BlogMapper.toView); // Get View models of Blogs

    return new PaginationDto<ViewBlogDto>(
      pagesCount,
      Number(queryObj.pageNumber),
      Number(queryObj.pageSize),
      totalCount,
      blogsViewModels,
    );
  }

  protected async findBlogByFilters(filters, queryObj, sortValue, skipValue): Promise<DbBlog[]> {
    let query =
      'SELECT b.id as "id", b.name as "name", b.description as "description", b.website_url as "websiteUrl", ' +
      'b.is_membership as "isMembership", b.created_at as "createdAt", b.user_id as "userId", ' +
      'sb.ban_date as "banDate", sb.id as "banId" ' +
      'FROM public."blog" b ' +
      'LEFT JOIN public."sa_blog_ban" sb ON b.id = sb.blog_id ';

    query += filters;
    query += ` ORDER BY "${queryObj.sortBy}" ${sortValue}`;
    query += ' LIMIT $1 ';
    query += ' OFFSET $2;';

    console.log(query);
    return await this.dataSource.query(query, [queryObj.pageSize, skipValue]);
  }

  protected async findExtendedBlogByFilters(filters, queryObj, sortValue, skipValue): Promise<DbBlogExtended[]> {
    let query =
      'SELECT b.id as "id", b.name as "name", b.description as "description", b.website_url as "websiteUrl", ' +
      'b.is_membership as "isMembership", b.created_at as "createdAt", b.user_id as "userId", ' +
      'sb.ban_date as "banDate", sb.id as "banId" ' +
      'FROM public."blog" b ' +
      'LEFT JOIN public."sa_blog_ban" sb ON b.id = sb.blog_id ' +
      'LEFT JOIN public."user" u ON b.user_id = u.id ' +
      'LEFT JOIN public."account" ac ON u.account_id = ac.id ';

    query += filters;
    query += ` ORDER BY "${queryObj.sortBy}" ${sortValue}`;
    query += ' LIMIT $1 ';
    query += ' OFFSET $2;';

    console.log(query);
    return await this.dataSource.query(query, [queryObj.pageSize, skipValue]);
  }

  protected getFilters(queryObj: QueryDto, skipBannedBlogs: boolean, userId: string | null = null): string {
    const sqlFilters = [];

    // TODO: change "sb.id" to another
    if (skipBannedBlogs) {
      sqlFilters.push('sb.id IS NULL');
    }

    if (userId) {
      sqlFilters.push(`user_id = '${userId}'`);
    }

    if (queryObj.searchNameTerm) {
      sqlFilters.push(`name ILIKE '%${queryObj.searchNameTerm}%'`);
    }

    if (sqlFilters.length > 0) {
      return 'WHERE ' + sqlFilters.join(' AND ');
    }

    return '';
  }
}
