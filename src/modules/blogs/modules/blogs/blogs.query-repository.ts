import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from './schemas/blog.schema';
import { Model } from 'mongoose';
import { BlogMapper } from './utils/blogs.mapper';
import { FilterType, QueryType } from '../../../../common/types/pagination';
import { Pagination } from '../../../../common/utils/pagination';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async findOne(id: string) {
    const dbBlog = await this.blogModel.findOne({ id });
    if (!dbBlog) throw new NotFoundException();

    return BlogMapper.toView(dbBlog);
  }

  async findBlogs(queryObj: QueryType) {
    const filters: FilterType = Pagination.getFilters(queryObj);
    const skipValue: number = Pagination.getSkipValue(filters.pageNumber, filters.pageSize);
    const sortValue: 1 | -1 = Pagination.getSortValue(filters.sortDirection);
    const searchNameTermValue = filters.searchNameTerm || '';

    const foundedBlogs = await this.blogModel
      .find({
        name: { $regex: new RegExp(searchNameTermValue, 'i') },
      })
      .sort({ [filters.sortBy]: sortValue })
      .skip(skipValue)
      .limit(filters.pageSize)
      .lean();

    const blogsViewModels = foundedBlogs.map(BlogMapper.toView); // Get View models of Blogs
    const totalCount: number = await this.blogModel.countDocuments({
      name: { $regex: new RegExp(searchNameTermValue, 'i') },
    });
    const pagesCount = Pagination.getPagesCount(totalCount, filters.pageSize);

    return {
      pagesCount: pagesCount,
      page: filters.pageNumber,
      pageSize: filters.pageSize,
      totalCount: totalCount,
      items: blogsViewModels,
    };
  }
}
