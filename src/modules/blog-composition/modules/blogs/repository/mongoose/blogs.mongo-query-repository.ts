import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BlogMongoEntity, BlogDocument } from './schemas/blog.schema';
import { Model } from 'mongoose';
import { BlogMapper } from '../../utils/blogs.mapper';
import { PaginationHelper } from '../../../../../../common/utils/paginationHelper';
import { QueryDto } from '../../../../../../common/dto/query.dto';
import { ViewBlogDto } from '../../models/output/view-blog.dto';
import { PaginationDto } from '../../../../../../common/dto/pagination';
import { ViewExtendedBlogDto } from '../../models/output/view-extended-blog.dto';
import { UsersRepository } from '../../../../../users/interfaces/users.repository';
import UserEntity from '../../../../../users/entities/user.entity';
import { BlogsQueryRepository } from '../../interfaces/blogs.query-repository';

@Injectable()
export class BlogsMongoQueryRepository extends BlogsQueryRepository {
  constructor(
    @InjectModel(BlogMongoEntity.name) private blogModel: Model<BlogDocument>,
    private usersRepository: UsersRepository,
  ) {
    super();
  }

  public async findOne(id: string): Promise<ViewBlogDto | null> {
    const dbBlog = await this.blogModel.findOne({ id, 'banInfo.isBanned': false });
    if (!dbBlog) return null;

    return BlogMapper.toView(dbBlog);
  }

  public async findAll(queryObj: QueryDto, skipBannedBlogs: boolean): Promise<PaginationDto<ViewBlogDto>> {
    const skipValue: number = PaginationHelper.getSkipValue(queryObj.pageNumber, queryObj.pageSize);
    const sortValue: 1 | -1 = PaginationHelper.getSortValue(queryObj.sortDirection);
    const filters = this.getFilters(queryObj, skipBannedBlogs); // TODO: add Class or Type to Filters Object

    const foundedBlogs: BlogMongoEntity[] = await this.findBlogByFilters(filters, queryObj, sortValue, skipValue);
    const blogsViewModels: ViewBlogDto[] = foundedBlogs.map(BlogMapper.toView); // Get View models of Blogs
    const totalCount: number = await this.blogModel.countDocuments(filters);
    const pagesCount = PaginationHelper.getPagesCount(totalCount, queryObj.pageSize);

    return new PaginationDto<ViewBlogDto>(
      pagesCount,
      Number(queryObj.pageNumber),
      Number(queryObj.pageSize),
      totalCount,
      blogsViewModels,
    );
  }

  // Only for SA
  public async findBlogsWithExtendedInfo(queryObj: QueryDto): Promise<PaginationDto<ViewExtendedBlogDto>> {
    const skipValue: number = PaginationHelper.getSkipValue(queryObj.pageNumber, queryObj.pageSize);
    const sortValue: 1 | -1 = PaginationHelper.getSortValue(queryObj.sortDirection);
    const filters = this.getFilters(queryObj, false);

    const foundedBlogs: BlogMongoEntity[] = await this.findBlogByFilters(filters, queryObj, sortValue, skipValue);
    const blogsViewModels: ViewExtendedBlogDto[] = await Promise.all(
      foundedBlogs.map(async (blog) => {
        const user: UserEntity | null = await this.usersRepository.findById(blog.userId);
        return BlogMapper.toExtendedViewFromDocument(blog, user);
      }),
    );

    const totalCount: number = await this.blogModel.countDocuments(filters);
    const pagesCount = PaginationHelper.getPagesCount(totalCount, queryObj.pageSize);

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
    const skipValue: number = PaginationHelper.getSkipValue(queryObj.pageNumber, queryObj.pageSize);
    const sortValue: 1 | -1 = PaginationHelper.getSortValue(queryObj.sortDirection);
    const filters = this.getFilters(queryObj, false, userId);

    const foundedBlogs: BlogMongoEntity[] = await this.findBlogByFilters(filters, queryObj, sortValue, skipValue);
    const blogsViewModels: ViewBlogDto[] = foundedBlogs.map(BlogMapper.toView); // Get View models of Blogs
    const totalCount: number = await this.blogModel.countDocuments(filters);
    const pagesCount = PaginationHelper.getPagesCount(totalCount, queryObj.pageSize);

    return new PaginationDto<ViewBlogDto>(
      pagesCount,
      Number(queryObj.pageNumber),
      Number(queryObj.pageSize),
      totalCount,
      blogsViewModels,
    );
  }

  protected async findBlogByFilters(filters, queryObj, sortValue, skipValue) {
    return this.blogModel
      .find(filters)
      .sort({ [queryObj.sortBy]: sortValue })
      .skip(skipValue)
      .limit(queryObj.pageSize)
      .lean()
      .exec();
  }

  protected getFilters(queryObj: QueryDto, skipBannedBlogs: boolean, userId: string | null = null): object {
    const filters = {
      name: { $regex: new RegExp(queryObj.searchNameTerm, 'i') },
    };

    if (skipBannedBlogs) {
      filters['banInfo.isBanned'] = false;
    }

    if (userId) {
      filters['userId'] = userId;
    }

    return filters;
  }
}
