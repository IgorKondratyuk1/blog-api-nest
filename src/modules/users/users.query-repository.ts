import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import ViewUserDto from './dto/view-user.dto';
import { UsersMapper } from './utils/users.mapper';
import { QueryUserDto } from './dto/query-user.dto';
import { Paginator } from '../../common/utils/paginator';
import { PaginationDto } from '../../common/dto/pagination';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findOne(id: string): Promise<ViewUserDto | null> {
    const dbUser: UserDocument | null = await this.userModel.findOne({ id });
    if (!dbUser) return null;

    return UsersMapper.toView(dbUser);
  }

  async findAll(queryObj: QueryUserDto): Promise<PaginationDto<ViewUserDto>> {
    const skipValue: number = Paginator.getSkipValue(queryObj.pageNumber, queryObj.pageSize);
    const sortValue: 1 | -1 = Paginator.getSortValue(queryObj.sortDirection);

    const foundedUsers: User[] = await this.userModel
      .find({
        $or: [
          {
            'accountData.login': {
              $regex: queryObj.searchLoginTerm,
              $options: 'i',
            },
          },
          {
            'accountData.email': {
              $regex: queryObj.searchEmailTerm,
              $options: 'i',
            },
          },
        ],
      })
      .sort({ [`accountData.${queryObj.sortBy}`]: sortValue })
      .skip(skipValue)
      .limit(queryObj.pageSize)
      .lean();

    const usersViewModels: ViewUserDto[] = foundedUsers.map(UsersMapper.toView);
    const totalCount: number = await this.userModel.countDocuments({
      $or: [
        {
          'accountData.login': { $regex: queryObj.searchLoginTerm, $options: 'i' },
        },
        {
          'accountData.email': { $regex: queryObj.searchEmailTerm, $options: 'i' },
        },
      ],
    });
    const pagesCount = Paginator.getPagesCount(totalCount, queryObj.pageSize);

    return new PaginationDto<ViewUserDto>(
      pagesCount,
      Number(queryObj.pageNumber),
      Number(queryObj.pageSize),
      totalCount,
      usersViewModels,
    );
  }
}
