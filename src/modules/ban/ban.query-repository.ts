import { QueryBannedUserDto } from '../users/dto/query-banned-user.dto';
import { PaginationDto } from '../../common/dto/pagination';
import ViewUserDto from '../users/dto/view-user.dto';
import { Paginator } from '../../common/utils/paginator';
import { UsersMapper } from '../users/utils/users.mapper';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BloggerBanInfo, BloggerBanInfoDocument } from './schemas/blogger-ban-info.schema';
import ViewUserInfoDto from '../users/dto/view-user-info.dto';

@Injectable()
export class BanQueryRepository {
  constructor(@InjectModel(BloggerBanInfo.name) private bloggerBanModel: Model<BloggerBanInfoDocument>) {}

  async findBannedUsersForBlog(blogId: string, queryObj: QueryBannedUserDto): Promise<PaginationDto<ViewUserInfoDto>> {
    const skipValue: number = Paginator.getSkipValue(queryObj.pageNumber, queryObj.pageSize);
    const sortValue: 1 | -1 = Paginator.getSortValue(queryObj.sortDirection);
    const filters = { ...queryObj, locationId: blogId, isBanned: true };

    const bansInfo: BloggerBanInfo[] = await this.bloggerBanModel
      .find(filters)
      .sort({ [`accountData.${queryObj.sortBy}`]: sortValue })
      .skip(skipValue)
      .limit(queryObj.pageSize)
      .lean();

    const usersInfoViewDto: ViewUserInfoDto[] = bansInfo.map((banInfo) => UsersMapper.toViewInfo(banInfo, true));
    const totalCount: number = await this.bloggerBanModel.countDocuments(filters);
    const pagesCount = Paginator.getPagesCount(totalCount, queryObj.pageSize);

    return new PaginationDto<ViewUserInfoDto>(
      pagesCount,
      Number(queryObj.pageNumber),
      Number(queryObj.pageSize),
      totalCount,
      usersInfoViewDto,
    );
  }
}
