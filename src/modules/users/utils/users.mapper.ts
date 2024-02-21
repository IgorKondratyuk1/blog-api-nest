import ViewUserDto from '../models/output/view-user.dto';
import { UserMongoEntity, UserDocument } from '../repository/mongoose/schemas/user.schema';
import { ViewMeDto } from '../models/output/view-me.dto';
import { BanMapper } from '../../ban/utils/ban-mapper';
import ViewUserInfoDto from '../models/output/view-user-info.dto';
import { BloggerBanInfo } from '../../ban/schemas/blogger-ban-info.schema';
import SaUserBanInfo from '../../ban/models/sa-user-ban.info';
import AccountEntity from '../entities/account.entity';
import EmailConfirmationEntity from '../entities/email-confirmation.entity';
import PasswordRecoveryEntity from '../entities/password-recovery.entity';
import UserEntity from '../entities/user.entity';

export class UsersMapper {
  public static toDomainFromDocument(user: UserMongoEntity | UserDocument): UserEntity {
    const accountData: AccountEntity = new AccountEntity(
      user.accountData.login,
      user.accountData.email,
      user.accountData.passwordHash,
      user.accountData.createdAt,
    );

    const banInfo: SaUserBanInfo = new SaUserBanInfo(
      user.banInfo.isBanned,
      user.banInfo.banDate,
      user.banInfo.banReason,
    );
    const emailConfirmation: EmailConfirmationEntity = new EmailConfirmationEntity(
      user.emailConfirmation.confirmationCode,
      user.emailConfirmation.expirationDate,
      user.emailConfirmation.isConfirmed,
    );

    let passwordRecovery: PasswordRecoveryEntity | null;

    if (user.passwordRecovery) {
      passwordRecovery = new PasswordRecoveryEntity(
        user.passwordRecovery.recoveryCode,
        user.passwordRecovery.expirationDate,
        user.passwordRecovery.isUsed,
      );
    } else {
      passwordRecovery = null;
    }

    return new UserEntity(user.id, user.createdAt, accountData, banInfo, emailConfirmation, passwordRecovery);
  }

  // TODO refactor
  public static toDomainFromPlainSql(
    id: string,
    createdAt: Date,
    accountDataLogin: string,
    accountDataEmail: string,
    accountDataPasswordHash: string,
    banInfoIsBanned: boolean,
    banInfoBanDate: Date,
    banInfoBanReason: string,
    emailConfirmationConfirmationCode: string | null,
    emailConfirmationExpirationDate: Date | null,
    emailConfirmationIsConfirmed: boolean | null,
    passwordRecoveryRecoveryCode: string | null,
    passwordRecoveryExpirationDate: Date | null,
    passwordRecoveryIsUsed: boolean | null,
  ): UserEntity {
    const accountData: AccountEntity = new AccountEntity(
      accountDataLogin,
      accountDataEmail,
      accountDataPasswordHash,
      createdAt,
    );

    const banInfo: SaUserBanInfo = new SaUserBanInfo(banInfoIsBanned, banInfoBanDate, banInfoBanReason);
    const emailConfirmation: EmailConfirmationEntity = new EmailConfirmationEntity(
      emailConfirmationConfirmationCode,
      emailConfirmationExpirationDate,
      emailConfirmationIsConfirmed,
    );

    let passwordRecovery: PasswordRecoveryEntity | null;

    if (passwordRecoveryRecoveryCode) {
      passwordRecovery = new PasswordRecoveryEntity(
        passwordRecoveryRecoveryCode,
        passwordRecoveryExpirationDate,
        passwordRecoveryIsUsed,
      );
    } else {
      passwordRecovery = null;
    }

    return new UserEntity(id, createdAt, accountData, banInfo, emailConfirmation, passwordRecovery);
  }

  public static toMongo(user: UserEntity): UserMongoEntity {
    const recoveryCode = user.passwordRecovery ? user.passwordRecovery.recoveryCode : null;
    const isUsed = user.passwordRecovery ? user.passwordRecovery.isUsed : null;
    const expirationDate = user.passwordRecovery ? user.passwordRecovery.expirationDate : null;

    return new UserMongoEntity(
      user.id,
      user.accountData.login,
      user.accountData.email,
      user.accountData.passwordHash,
      user.createdAt,
      user.emailConfirmation.confirmationCode,
      user.emailConfirmation.expirationDate,
      user.emailConfirmation.isConfirmed,
      user.banInfo.isBanned,
      user.banInfo.banDate,
      user.banInfo.banReason,
      isUsed,
      expirationDate,
      recoveryCode,
    );
  }

  public static toView(user: UserEntity | UserMongoEntity): ViewUserDto {
    const banInfo = BanMapper.toBanExtendedInfoView(
      user.banInfo.isBanned,
      user.banInfo.banReason,
      user.banInfo.banDate,
    );

    return new ViewUserDto(
      user.id,
      user.accountData.login,
      user.accountData.email,
      user.createdAt ? user.createdAt.toISOString() : null,
      // banInfo,
    );
  }

  public static toViewInfo(bloggerBanInfo: BloggerBanInfo, isBanned: boolean): ViewUserInfoDto {
    const banInfo = BanMapper.toBanExtendedInfoView(isBanned, bloggerBanInfo.banReason, bloggerBanInfo.createdAt);

    return new ViewUserInfoDto(bloggerBanInfo.userId, bloggerBanInfo.userLogin, banInfo);
  }

  public static toViewMe(user: UserMongoEntity | UserEntity): ViewMeDto {
    return new ViewMeDto(user.id, user.accountData.login, user.accountData.email);
  }
}
