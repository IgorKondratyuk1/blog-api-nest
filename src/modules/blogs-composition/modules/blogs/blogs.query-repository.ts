import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from './schemas/blog.schema';
import { Model } from 'mongoose';
import { BlogMapper } from './utils/blogs.mapper';
import { Paginator } from '../../../../common/utils/paginator';
import { QueryDto } from '../../../../common/dto/query.dto';
import { ViewBlogDto } from './dto/view-blog.dto';
import { PaginationDto } from '../../../../common/dto/pagination';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async findOne(id: string): Promise<ViewBlogDto | null> {
    const dbBlog = await this.blogModel.findOne({ id });
    if (!dbBlog) return null;

    return BlogMapper.toView(dbBlog);
  }

  async findBlogs(queryObj: QueryDto): Promise<PaginationDto<ViewBlogDto>> {
    const skipValue: number = Paginator.getSkipValue(queryObj.pageNumber, queryObj.pageSize);
    const sortValue: 1 | -1 = Paginator.getSortValue(queryObj.sortDirection);

    const foundedBlogs = await this.blogModel
      .find({
        name: { $regex: new RegExp(queryObj.searchNameTerm, 'i') },
      })
      .sort({ [queryObj.sortBy]: sortValue })
      .skip(skipValue)
      .limit(queryObj.pageSize)
      .lean();

    const blogsViewModels: ViewBlogDto[] = foundedBlogs.map(BlogMapper.toView); // Get View models of Blogs
    const totalCount: number = await this.blogModel.countDocuments({
      name: { $regex: new RegExp(queryObj.searchNameTerm, 'i') },
    });
    const pagesCount = Paginator.getPagesCount(totalCount, queryObj.pageSize);

    return new PaginationDto<ViewBlogDto>(
      pagesCount,
      Number(queryObj.pageNumber),
      Number(queryObj.pageSize),
      totalCount,
      blogsViewModels,
    );
  }
}
