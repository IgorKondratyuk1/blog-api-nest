import { Injectable } from '@nestjs/common';
import ViewUserDto from '../../models/output/view-user.dto';
import { QueryUserDto } from '../../models/input/query-user.dto';
import { PaginationDto } from '../../../../common/dto/pagination';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UsersQueryRepository } from '../../interfaces/users.query-repository';
import { UsersMapper } from '../../utils/users.mapper';
import { PaginationHelper } from '../../../../common/utils/paginationHelper';
import { dbFullUser } from './types/user';
import UserEntity from '../../entities/user.entity';

@Injectable()
export class UsersPgQueryRepository extends UsersQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super();
  }

  // All data about user. Only for SA
  async findAll(queryObj: QueryUserDto): Promise<PaginationDto<ViewUserDto>> {
    console.log(queryObj);
    const skipValue: number = PaginationHelper.getSkipValue(queryObj.pageNumber, queryObj.pageSize);
    const sortValue: string = queryObj.sortDirection.toUpperCase();
    const filters = this.getUsersFilters(queryObj);

    const queryTotalCount = `SELECT count(*) FROM public."user" u LEFT JOIN public."account" acc ON u.account_id = acc.id ${filters};`;
    console.log(queryTotalCount);
    const resultTotalCount = await this.dataSource.query(queryTotalCount);
    const totalCount = Number(resultTotalCount[0].count);
    const pagesCount = PaginationHelper.getPagesCount(totalCount, queryObj.pageSize);

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
    query += ` ORDER BY "${queryObj.sortBy}" ${sortValue}`;
    query += ' LIMIT $1 ';
    query += ' OFFSET $2;';

    console.log(query);

    const result: dbFullUser[] = await this.dataSource.query(query, [queryObj.pageSize, skipValue]);

    const userEntities: UserEntity[] = result.map((dbUser) => {
      const isBanned = !!dbUser.userBanId;
      return UsersMapper.toDomainFromPlainSql(
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

    const usersViewModels = userEntities.map((user) => {
      return UsersMapper.toView(user);
    });

    return new PaginationDto<ViewUserDto>(
      pagesCount,
      Number(queryObj.pageNumber),
      Number(queryObj.pageSize),
      totalCount,
      usersViewModels,
    );
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
