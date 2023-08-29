import { Injectable } from '@nestjs/common';
import ViewUserDto from '../../dto/output/view-user.dto';
import { QueryUserDto } from '../../dto/input/query-user.dto';
import { PaginationDto } from '../../../../common/dto/pagination';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UsersQueryRepository } from '../../interfaces/users.query-repository';
import { UsersMapper } from '../../utils/users.mapper';
import { Paginator } from '../../../../common/utils/paginator';
import { dbFullUser } from './types/user';
import UserModel from '../../models/user.model';

@Injectable()
export class UsersPgQueryRepository extends UsersQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super();
  }

  // All data about user. Only for SA
  async findAll(queryObj: QueryUserDto): Promise<PaginationDto<ViewUserDto>> {
    const skipValue: number = Paginator.getSkipValue(queryObj.pageNumber, queryObj.pageSize);
    const sortValue: 1 | -1 = Paginator.getSortValue(queryObj.sortDirection);
    const filters = this.getUsersFilters(queryObj);

    const queryTotalCount = 'SELECT count(*) FROM public."user";';
    const resultTotalCount = await this.dataSource.query(queryTotalCount);
    const totalCount: number = resultTotalCount[0].count;
    const pagesCount = Paginator.getPagesCount(totalCount, queryObj.pageSize);

    let query =
      'SELECT u.id as "userId", u.user_ban_id as "userBanId", u.created_at as "createdAt", ' +
      'ac.id as "accountId", ac.login as "login", ac.email as "email", ac.password_hash as "passwordHash", ' +
      'ec.confirmation_code as "emailConfirmationCode", ec.expiration_date as "emailCodeExpirationDate", ec.is_confirmed as "isEmailConfirmed", ' +
      'pr.recovery_code as "passwordRecoveryCode", pr.expiration_date as "passwordRecoveryExpirationDate", pr.is_used as "isRecoveryUsed", ' +
      'sb.ban_date as "banDate", sb.ban_reason as "banReason"' +
      'FROM public."user" u ' +
      'LEFT JOIN public."account" ac ON u.account_id = ac.id ' +
      'LEFT JOIN public."email_confirmation" ec ON u.email_confirmation_id = ec.id ' +
      'LEFT JOIN public."password_recovery" pr ON u.password_recovery_id = pr.id ' +
      'LEFT JOIN public."sa_user_ban" sb ON u.user_ban_id = sb.id ';
    query += filters;
    query += 'ORDER BY $1 ';
    query += 'LIMIT $2 ';
    query += 'OFFSET $3;';

    console.log(query);

    const result: dbFullUser[] = await this.dataSource.query(query, [queryObj.sortBy, queryObj.pageSize, skipValue]);

    const userModels: UserModel[] = result.map((dbUser) => {
      const isBanned = !!dbUser.userBanId;
      return UsersMapper.toDomainSql(
        dbUser.userId,
        dbUser.createdAt,
        dbUser.login,
        dbUser.email,
        dbUser.passwordHash,
        isBanned,
        dbUser.banDate,
        dbUser.banReason,
        dbUser.emailConfirmationCode,
        dbUser.emailCodeExpirationDate,
        dbUser.isEmailConfirmed,
        dbUser.passwordRecoveryCode,
        dbUser.passwordRecoveryExpirationDate,
        dbUser.isRecoveryUsed,
      );
    });

    const usersViewModels = userModels.map((user) => {
      return UsersMapper.toView(user);
    });

    return new PaginationDto<ViewUserDto>(
      pagesCount,
      Number(queryObj.pageNumber),
      Number(queryObj.pageSize),
      totalCount,
      usersViewModels,
    );

    return new PaginationDto<ViewUserDto>(null, 0, 0, 0, null);
  }

  getUsersFilters = (queryObj: QueryUserDto): string => {
    const { banStatus, searchLoginTerm, searchEmailTerm } = queryObj;

    const sqlFilters = [];

    if (banStatus === 'banned') {
      sqlFilters.push('user_ban_id IS NOT NULL');
    } else if (banStatus === 'notBanned') {
      sqlFilters.push('user_ban_id IS NULL');
    }

    const searchFilters = [];

    if (searchLoginTerm) {
      searchFilters.push(`login ILIKE '%${searchLoginTerm}%'`);
    }

    if (searchEmailTerm) {
      searchFilters.push(`email ILIKE '%${searchEmailTerm}%'`);
    }

    if (searchFilters.length > 0) {
      sqlFilters.push(`(${searchFilters.join(' OR ')})`);
    }

    if (sqlFilters.length > 0) {
      return 'WHERE ' + sqlFilters.join(' AND ');
    }

    return '';
  };
}
