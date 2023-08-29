import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import ViewUserDto from '../../dto/output/view-user.dto';
import { UsersMapper } from '../../utils/users.mapper';
import { QueryUserDto } from '../../dto/input/query-user.dto';
import { Paginator } from '../../../../common/utils/paginator';
import { PaginationDto } from '../../../../common/dto/pagination';
import { UsersPaginator } from '../../utils/users.pagination';
import { UsersQueryRepository } from '../../interfaces/users.query-repository';

export type UsersFilterType = {
  'banInfo.isBanned': boolean;
  $or: (
    | { 'accountData.login': { $regex: string; $options: string } }
    | { 'accountData.email': { $regex: string; $options: string } }
  )[];
};

@Injectable()
export class UsersMongoQueryRepository extends UsersQueryRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    super();
  }

  async findById(id: string): Promise<ViewUserDto | null> {
    const dbUser: UserDocument | null = await this.userModel.findOne({ id });
    if (!dbUser) return null;

    return UsersMapper.toView(dbUser);
  }

  // All data about user. Only for SA
  async findAll(queryObj: QueryUserDto): Promise<PaginationDto<ViewUserDto>> {
    const skipValue: number = Paginator.getSkipValue(queryObj.pageNumber, queryObj.pageSize);
    const sortValue: 1 | -1 = Paginator.getSortValue(queryObj.sortDirection);
    const filters = this.getUsersFilters(queryObj);

    const foundedUsers: UserDocument[] = await this.userModel
      .find(filters)
      .sort({ [`accountData.${queryObj.sortBy}`]: sortValue })
      .skip(skipValue)
      .limit(queryObj.pageSize)
      .lean();

    const usersViewModels: ViewUserDto[] = foundedUsers.map(UsersMapper.toView);
    const totalCount: number = await this.userModel.countDocuments(filters);
    const pagesCount = Paginator.getPagesCount(totalCount, queryObj.pageSize);

    return new PaginationDto<ViewUserDto>(
      pagesCount,
      Number(queryObj.pageNumber),
      Number(queryObj.pageSize),
      totalCount,
      usersViewModels,
    );
  }

  public getUsersFilters = (queryObj: QueryUserDto): UsersFilterType => {
    const banStatus: boolean | null = UsersPaginator.getBanStatus(queryObj.banStatus);

    return {
      ...(banStatus !== null && { 'banInfo.isBanned': banStatus }),
      $or: [
        {
          'accountData.login': { $regex: queryObj.searchLoginTerm, $options: 'i' },
        },
        {
          'accountData.email': { $regex: queryObj.searchEmailTerm, $options: 'i' },
        },
      ],
    };
  };
}
