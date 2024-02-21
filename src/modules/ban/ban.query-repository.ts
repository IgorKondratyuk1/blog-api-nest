import { QueryBannedUserDto } from '../users/models/input/query-banned-user.dto';
import { PaginationDto } from '../../common/dto/pagination';
import { PaginationHelper } from '../../common/utils/paginationHelper';
import { UsersMapper } from '../users/utils/users.mapper';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BloggerBanInfo, BloggerBanInfoDocument } from './schemas/blogger-ban-info.schema';
import ViewUserInfoDto from '../users/models/output/view-user-info.dto';

@Injectable()
export class BanQueryRepository {
  constructor(@InjectModel(BloggerBanInfo.name) private bloggerBanModel: Model<BloggerBanInfoDocument>) {}

  async findBannedUsersForBlog(blogId: string, queryObj: QueryBannedUserDto): Promise<PaginationDto<ViewUserInfoDto>> {
    const skipValue: number = PaginationHelper.getSkipValue(queryObj.pageNumber, queryObj.pageSize);
    const sortValue: 1 | -1 = PaginationHelper.getSortValue(queryObj.sortDirection);
    const filters = { ...queryObj, locationId: blogId, isBanned: true };

    // TODO fix
    const sortBy = queryObj.sortBy === 'login' ? 'userLogin' : queryObj.sortBy;

    const bansInfo: BloggerBanInfo[] = await this.bloggerBanModel
      .find(filters)
      .sort({ [`${sortBy}`]: sortValue })
      .skip(skipValue)
      .limit(queryObj.pageSize)
      .lean();

    const usersInfoViewDto: ViewUserInfoDto[] = bansInfo.map((banInfo) => UsersMapper.toViewInfo(banInfo, true));
    const totalCount: number = await this.bloggerBanModel.countDocuments(filters);
    const pagesCount = PaginationHelper.getPagesCount(totalCount, queryObj.pageSize);

    return new PaginationDto<ViewUserInfoDto>(
      pagesCount,
      Number(queryObj.pageNumber),
      Number(queryObj.pageSize),
      totalCount,
      usersInfoViewDto,
    );
  }
}
