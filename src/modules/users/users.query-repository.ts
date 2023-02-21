import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { QueryUserModel, UserFilterType } from './types/user';

import ViewUserDto from './dto/view-user.dto';
import { UsersMapper } from './utils/users.mapper';
import { Pagination } from '../../common/utils/pagination';
import { Paginator } from '../../common/types/pagination';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll(queryObj: QueryUserModel): Promise<Paginator<ViewUserDto>> {
    const filters: UserFilterType = Pagination.getUserFilters(queryObj); // TODO Delete
    console.log(filters);
    const skipValue: number = Pagination.getSkipValue(filters.pageNumber, filters.pageSize);
    const sortValue: 1 | -1 = Pagination.getSortValue(filters.sortDirection);
    const searchLoginTermValue = filters.searchLoginTerm || '';
    const searchEmailTermValue = filters.searchEmailTerm || '';

    const foundedUsers: User[] = await this.userModel
      .find({
        $or: [
          {
            'accountData.login': {
              $regex: searchLoginTermValue,
              $options: 'i',
            },
          },
          {
            'accountData.email': {
              $regex: searchEmailTermValue,
              $options: 'i',
            },
          },
        ],
      })
      .sort({ [`accountData.${filters.sortBy}`]: sortValue })
      .skip(skipValue)
      .limit(filters.pageSize)
      .lean();

    console.log(foundedUsers);

    const usersViewModels: ViewUserDto[] = foundedUsers.map(UsersMapper.toView);
    const totalCount: number = await this.userModel.countDocuments({
      $or: [
        {
          'accountData.login': { $regex: searchLoginTermValue, $options: 'i' },
        },
        {
          'accountData.email': { $regex: searchEmailTermValue, $options: 'i' },
        },
      ],
    });
    const pagesCount = Pagination.getPagesCount(totalCount, filters.pageSize);

    return {
      pagesCount: pagesCount,
      page: filters.pageNumber,
      pageSize: filters.pageSize,
      totalCount: totalCount,
      items: usersViewModels,
    };
  }

  async findOne(id: string) {
    const dbUser = await this.userModel.findOne({ id });
    if (!dbUser) throw new NotFoundException();

    return UsersMapper.toView(dbUser);
  }
}
