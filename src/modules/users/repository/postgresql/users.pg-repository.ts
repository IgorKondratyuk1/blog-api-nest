import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../interfaces/users.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import IdGenerator from '../../../../common/utils/id-generator';
import { UsersMapper } from '../../utils/users.mapper';
import { dbFullUser, dbUser } from './types/user';
import SaUserBanInfo from '../../../ban/models/sa-user-ban.info';
import UserEntity from '../../entities/user.entity';
import EmailConfirmationEntity from '../../entities/email-confirmation.entity';
import PasswordRecoveryEntity from '../../entities/password-recovery.entity';

@Injectable()
export class UsersPgRepository extends UsersRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super();
  }

  async save(user: UserEntity): Promise<boolean> {
    try {
      const getUserQuery =
        'SELECT id, u.created_at as "createdAt", u.account_id as "accountId", u.user_ban_id as "userBanId", ' +
        'u.email_confirmation_id as "emailConfirmationId", u.password_recovery_id as "passwordRecoveryId" ' +
        'FROM public."user" u WHERE u.id = $1;';

      const resultGetUserQuery: dbUser[] = await this.dataSource.query(getUserQuery, [user.id]);
      if (resultGetUserQuery.length === 0) return false;

      const updateAccountQuery = 'UPDATE public.account SET login=$1, email=$2, password_hash=$3 WHERE id=$4;';
      const resultUpdateAccountQuery = await this.dataSource.query(updateAccountQuery, [
        user.accountData.login,
        user.accountData.email,
        user.accountData.passwordHash,
        resultGetUserQuery[0].accountId,
      ]);

      console.log('resultUpdateAccountQuery');
      console.log(resultUpdateAccountQuery);

      // const updateEmailConfirmationQuery =
      //   'UPDATE public.email_confirmation SET confirmation_code=$1, expiration_date=$2, is_confirmed=$3 WHERE id=$4;';
      // const resultEmailConfirmationQuery = await this.dataSource.query(updateEmailConfirmationQuery, [
      //   user.emailConfirmation.confirmationCode,
      //   user.emailConfirmation.expirationDate.toISOString(),
      //   user.emailConfirmation.isConfirmed,
      //   resultGetUserQuery[0].emailConfirmationId,
      // ]);
      //
      // if (resultGetUserQuery[0].passwordRecoveryId) {
      //   // TODO Create passwordRecoveryId if not exist
      //   const updatePasswordRecoveryQuery =
      //     'UPDATE public.password_recovery SET recovery_code=$1, expiration_date=$2, is_used=$3 WHERE ec.id=$4;';
      //   const resultPasswordRecoveryQuery = await this.dataSource.query(updatePasswordRecoveryQuery, [
      //     user.passwordRecovery.recoveryCode,
      //     user.passwordRecovery.expirationDate.toISOString(),
      //     user.passwordRecovery.isUsed,
      //     resultGetUserQuery[0].passwordRecoveryId,
      //   ]);
      // }

      await this.saveEmailConfirmation(resultGetUserQuery, user.emailConfirmation);

      await this.saveBanInfo(resultGetUserQuery, user.banInfo);

      await this.savePasswordRecovery(resultGetUserQuery, user.passwordRecovery);

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async saveEmailConfirmation(
    resultGetUserQuery: dbUser[],
    emailConfirmation: EmailConfirmationEntity,
  ): Promise<boolean> {
    try {
      // 1. Is no emailConfirmationId in DB but get new status confirmationCode exists - create EmailConfirmationId
      if (!resultGetUserQuery[0].emailConfirmationId && emailConfirmation.confirmationCode) {
        const createdEmailConfirmationId = IdGenerator.generate();
        const createEmailConfirmationQuery =
          'INSERT INTO public.email_confirmation(confirmation_code, expiration_date, is_confirmed, id) VALUES ($1, $2, $3, $4);';
        const resultEmailConfirmationQuery = await this.dataSource.query(createEmailConfirmationQuery, [
          emailConfirmation.confirmationCode,
          emailConfirmation.expirationDate,
          emailConfirmation.isConfirmed,
          createdEmailConfirmationId,
        ]);

        const updateUserQuery = 'UPDATE public."user" SET email_confirmation_id=$1 WHERE id=$2;';
        const resultUserQuery = await this.dataSource.query(updateUserQuery, [
          createdEmailConfirmationId,
          resultGetUserQuery[0].id,
        ]);
      }

      // 2. Is no emailConfirmationId in DB but get new status confirmationCode exists - create BanInfo
      if (resultGetUserQuery[0].emailConfirmationId && emailConfirmation.confirmationCode) {
        const updateEmailConfirmationQuery =
          'UPDATE public.email_confirmation SET confirmation_code=$1, expiration_date=$2, is_confirmed=$3 WHERE id=$4;';
        const resultEmailConfirmationQuery = await this.dataSource.query(updateEmailConfirmationQuery, [
          emailConfirmation.confirmationCode,
          emailConfirmation.expirationDate,
          emailConfirmation.isConfirmed,
          resultGetUserQuery[0].emailConfirmationId,
        ]);
      }

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async saveBanInfo(resultGetUserQuery: dbUser[], banInfo: SaUserBanInfo): Promise<boolean> {
    try {
      // 1. No userBanId in DB but get new status isBanned === true - create BanInfo
      if (!resultGetUserQuery[0].userBanId && banInfo.isBanned) {
        const createdBanInfoId = IdGenerator.generate();
        const createBanInfoQuery = 'INSERT INTO public.sa_user_ban(ban_date, ban_reason, id) VALUES ($1, $2, $3);';
        const resultBanInfoQuery: dbFullUser[] = await this.dataSource.query(createBanInfoQuery, [
          banInfo.banDate.toISOString(),
          banInfo.banReason,
          createdBanInfoId,
        ]);

        const updateUserQuery = 'UPDATE public."user" SET user_ban_id=$1 WHERE id = $2;';
        const resultUpdateUserQuery = await this.dataSource.query(updateUserQuery, [
          createdBanInfoId,
          resultGetUserQuery[0].id,
        ]);
      }

      // 2. Have userBanId in DB but get new status isBanned === false - delete BanInfo
      if (resultGetUserQuery[0].userBanId && !banInfo.isBanned) {
        const deleteBanInfoId = 'DELETE FROM public.sa_user_ban WHERE id=$1;';
        const resultBanInfoQuery = await this.dataSource.query(deleteBanInfoId, [resultGetUserQuery[0].id]);

        const updateUserQuery = 'UPDATE public."user" SET user_ban_id=$1 WHERE id = $2;';
        const resultUserQuery = await this.dataSource.query(updateUserQuery, [null, resultGetUserQuery[0].id]);
      }

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async savePasswordRecovery(resultGetUserQuery: dbUser[], passwordRecovery: PasswordRecoveryEntity): Promise<boolean> {
    try {
      // 1. Is no passwordRecoveryId in DB but get new status confirmationCode exists - create PasswordRecovery
      if (!resultGetUserQuery[0].passwordRecoveryId && passwordRecovery) {
        const createdPasswordRecoveryId = IdGenerator.generate();
        const createEmailConfirmationQuery =
          'INSERT INTO public.password_recovery(recovery_code, expiration_date, is_used, id) VALUES ($1, $2, $3, $4);';
        const resultEmailConfirmationQuery = await this.dataSource.query(createEmailConfirmationQuery, [
          passwordRecovery.recoveryCode,
          passwordRecovery.expirationDate,
          passwordRecovery.isUsed,
          createdPasswordRecoveryId,
        ]);

        const updateUserQuery = 'UPDATE public."user" SET password_recovery_id=$1 WHERE id=$2;';
        const resultUserQuery = await this.dataSource.query(updateUserQuery, [
          createdPasswordRecoveryId,
          resultGetUserQuery[0].id,
        ]);
      }

      // 2. Is no passwordRecoveryId in DB but get new status confirmationCode exists - create PasswordRecovery
      if (resultGetUserQuery[0].passwordRecoveryId && passwordRecovery) {
        const updateEmailConfirmationQuery =
          'UPDATE public.password_recovery SET recovery_code=$1, expiration_date=$2, is_used=$3 WHERE id=$4;';
        const resultEmailConfirmationQuery = await this.dataSource.query(updateEmailConfirmationQuery, [
          passwordRecovery.recoveryCode,
          passwordRecovery.expirationDate,
          passwordRecovery.isUsed,
          resultGetUserQuery[0].passwordRecoveryId,
        ]);
      }

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async create(userModel: UserEntity): Promise<UserEntity | null> {
    try {
      // Account
      const accountId = IdGenerator.generate();
      const accountQuery = `INSERT INTO public.account(id, login, email, password_hash, created_at) VALUES ($1, $2, $3, $4, $5);`;
      await this.dataSource.query(accountQuery, [
        accountId,
        userModel.accountData.login,
        userModel.accountData.email,
        userModel.accountData.passwordHash,
        userModel.accountData.createdAt,
      ]);

      // Email confirmation
      const emailConfirmationId = IdGenerator.generate();
      const emailConfirmationInsertQuery = `INSERT INTO public.email_confirmation(id, confirmation_code, expiration_date, is_confirmed) VALUES ($1, $2, $3, $4);`;
      await this.dataSource.query(emailConfirmationInsertQuery, [
        emailConfirmationId,
        userModel.emailConfirmation.confirmationCode,
        userModel.emailConfirmation.expirationDate.toISOString(),
        userModel.emailConfirmation.isConfirmed,
      ]);

      const userQuery = `INSERT INTO public."user"(id, account_id, email_confirmation_id, user_ban_id, password_recovery_id, created_at) VALUES ($1, $2, $3, $4, $5, $6);`;
      await this.dataSource.query(userQuery, [
        userModel.id,
        accountId,
        emailConfirmationId,
        null,
        null,
        userModel.createdAt.toISOString(),
      ]);

      const createdUser: UserEntity | null = await this.findById(userModel.id);
      return createdUser;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findById(id: string): Promise<UserEntity | null> {
    try {
      const query =
        'SELECT u.id as "userId", u.user_ban_id as "userBanId", u.created_at as "createdAt", ' +
        'ac.id as "accountId", ac.login as "login", ac.email as "email", ac.password_hash as "passwordHash", ' +
        'ec.confirmation_code as "emailConfirmationCode", ec.expiration_date as "emailCodeExpirationDate", ec.is_confirmed as "isEmailConfirmed", ' +
        'pr.recovery_code as "passwordRecoveryCode", pr.expiration_date as "passwordRecoveryExpirationDate", pr.is_used as "isRecoveryUsed", ' +
        'sb.ban_date as "banDate", sb.ban_reason as "banReason"' +
        'FROM public."user" u ' +
        'LEFT JOIN public."account" ac ON u.account_id = ac.id ' +
        'LEFT JOIN public."email_confirmation" ec ON u.email_confirmation_id = ec.id ' +
        'LEFT JOIN public."password_recovery" pr ON u.password_recovery_id = pr.id ' +
        'LEFT JOIN public."sa_user_ban" sb ON u.user_ban_id = sb.id ' +
        'WHERE u.id = $1;';

      const result: dbFullUser[] = await this.dataSource.query(query, [id]);
      if (result.length === 0) return null;

      const dbUser = result[0];
      const isBanned = !!dbUser.userBanId;

      console.log(dbUser);
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
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findUserByLoginOrEmail(loginOrEmail: string): Promise<UserEntity | null> {
    try {
      const query =
        'SELECT u.id as "userId", u.user_ban_id as "userBanId", u.created_at as "createdAt", ' +
        'ac.id as "accountId", ac.login as "login", ac.email as "email", ac.password_hash as "passwordHash", ' +
        'ec.confirmation_code as "emailConfirmationCode", ec.expiration_date as "emailCodeExpirationDate", ec.is_confirmed as "isEmailConfirmed", ' +
        'pr.recovery_code as "passwordRecoveryCode", pr.expiration_date as "passwordRecoveryExpirationDate", pr.is_used as "isRecoveryUsed", ' +
        'sb.ban_date as "banDate", sb.ban_reason as "banReason"' +
        'FROM public."user" u ' +
        'LEFT JOIN public."account" ac ON u.account_id = ac.id ' +
        'LEFT JOIN public."email_confirmation" ec ON u.email_confirmation_id = ec.id ' +
        'LEFT JOIN public."password_recovery" pr ON u.password_recovery_id = pr.id ' +
        'LEFT JOIN public."sa_user_ban" sb ON u.user_ban_id = sb.id ' +
        'WHERE ac.login = $1 OR ac.email = $1;';

      const result: dbFullUser[] = await this.dataSource.query(query, [loginOrEmail]);
      if (result.length === 0) return null;

      const dbUser = result[0];
      const isBanned = !!dbUser.userBanId;

      console.log(dbUser);
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
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findUserByEmailConfirmationCode(code: string): Promise<UserEntity | null> {
    try {
      const query =
        'SELECT u.id as "userId", u.user_ban_id as "userBanId", u.created_at as "createdAt", ' +
        'ac.id as "accountId", ac.login as "login", ac.email as "email", ac.password_hash as "passwordHash", ' +
        'ec.confirmation_code as "emailConfirmationCode", ec.expiration_date as "emailCodeExpirationDate", ec.is_confirmed as "isEmailConfirmed", ' +
        'pr.recovery_code as "passwordRecoveryCode", pr.expiration_date as "passwordRecoveryExpirationDate", pr.is_used as "isRecoveryUsed", ' +
        'sb.ban_date as "banDate", sb.ban_reason as "banReason"' +
        'FROM public."user" u ' +
        'LEFT JOIN public."account" ac ON u.account_id = ac.id ' +
        'LEFT JOIN public."email_confirmation" ec ON u.email_confirmation_id = ec.id ' +
        'LEFT JOIN public."password_recovery" pr ON u.password_recovery_id = pr.id ' +
        'LEFT JOIN public."sa_user_ban" sb ON u.user_ban_id = sb.id ' +
        'WHERE ec.confirmation_code = $1;';

      const result: dbFullUser[] = await this.dataSource.query(query, [code]);
      if (result.length === 0) return null;

      const dbUser = result[0];
      const isBanned = !!dbUser.userBanId;

      console.log(dbUser);
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
      return null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findUserByPasswordConfirmationCode(code: string): Promise<UserEntity | null> {
    try {
      const query =
        'SELECT u.id as "userId", u.user_ban_id as "userBanId", u.created_at as "createdAt", ' +
        'ac.id as "accountId", ac.login as "login", ac.email as "email", ac.password_hash as "passwordHash", ' +
        'ec.confirmation_code as "emailConfirmationCode", ec.expiration_date as "emailCodeExpirationDate", ec.is_confirmed as "isEmailConfirmed", ' +
        'pr.recovery_code as "passwordRecoveryCode", pr.expiration_date as "passwordRecoveryExpirationDate", pr.is_used as "isRecoveryUsed", ' +
        'sb.ban_date as "banDate", sb.ban_reason as "banReason"' +
        'FROM public."user" u ' +
        'LEFT JOIN public."account" ac ON u.account_id = ac.id ' +
        'LEFT JOIN public."email_confirmation" ec ON u.email_confirmation_id = ec.id ' +
        'LEFT JOIN public."password_recovery" pr ON u.password_recovery_id = pr.id ' +
        'LEFT JOIN public."sa_user_ban" sb ON u.user_ban_id = sb.id ' +
        'WHERE pr.recovery_code = $1;';

      const result: dbFullUser[] = await this.dataSource.query(query, [code]);
      if (result.length === 0) return null;

      console.log(query);
      console.log(result);

      const dbUser = result[0];
      const isBanned = !!dbUser.userBanId;

      console.log(dbUser);
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
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      const query = 'DELETE FROM public."user" u WHERE u.id = $1;';
      const result = await this.dataSource.query(query, [id]);
      console.log(result);
      return result[1] === 1;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async removeAll(): Promise<boolean> {
    try {
      const deleteUsersQuery = 'DELETE FROM public."user";';
      const resultDeleteUsers = await this.dataSource.query(deleteUsersQuery);
      //console.log(resultDeleteUsers);

      const deleteAccountQuery = 'DELETE FROM public."account";';
      const resultDeleteAccount = await this.dataSource.query(deleteAccountQuery);
      //console.log(resultDeleteAccount);

      const deleteEmailConfirmationQuery = 'DELETE FROM public."email_confirmation";';
      const resultDeleteEmailConfirmation = await this.dataSource.query(deleteEmailConfirmationQuery);
      //console.log(resultDeleteEmailConfirmation);

      const deletePasswordRecoveryQuery = 'DELETE FROM public."password_recovery";';
      const resultPasswordRecoveryQuery = await this.dataSource.query(deletePasswordRecoveryQuery);
      //console.log(resultPasswordRecoveryQuery);

      return true; // TODO result[1] >= 0;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
