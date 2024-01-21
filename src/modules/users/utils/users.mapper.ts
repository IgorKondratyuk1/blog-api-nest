import ViewUserDto from '../dto/output/view-user.dto';
import { User, UserDocument } from '../repository/mongoose/schemas/user.schema';
import { ViewMeDto } from '../dto/output/view-me.dto';
import { BanMapper } from '../../ban/utils/ban-mapper';
import ViewUserInfoDto from '../dto/output/view-user-info.dto';
import { BloggerBanInfo } from '../../ban/schemas/blogger-ban-info.schema';
import UserModel from '../models/user.model';
import Account from '../models/account.model';
import SaUserBanInfo from '../../ban/models/sa-user-ban.info';
import EmailConfirmation from '../models/email-confirmation.model';
import PasswordRecovery from '../models/password-recovery.model';

export class UsersMapper {
  public static toDomainFromDocument(user: User | UserDocument): UserModel {
    const accountData: Account = new Account(
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
    const emailConfirmation: EmailConfirmation = new EmailConfirmation(
      user.emailConfirmation.confirmationCode,
      user.emailConfirmation.expirationDate,
      user.emailConfirmation.isConfirmed,
    );

    let passwordRecovery: PasswordRecovery | null;

    if (passwordRecovery) {
      passwordRecovery = new PasswordRecovery(
        user.passwordRecovery.recoveryCode,
        user.passwordRecovery.expirationDate,
        user.passwordRecovery.isUsed,
      );
    } else {
      passwordRecovery = null;
    }

    return new UserModel(user.id, user.createdAt, accountData, banInfo, emailConfirmation, passwordRecovery);
  }

  // TODO refactor
  public static toDomainFromSql(
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
  ): UserModel {
    const accountData: Account = new Account(accountDataLogin, accountDataEmail, accountDataPasswordHash, createdAt);

    const banInfo: SaUserBanInfo = new SaUserBanInfo(banInfoIsBanned, banInfoBanDate, banInfoBanReason);
    const emailConfirmation: EmailConfirmation = new EmailConfirmation(
      emailConfirmationConfirmationCode,
      emailConfirmationExpirationDate,
      emailConfirmationIsConfirmed,
    );

    let passwordRecovery: PasswordRecovery | null;

    if (passwordRecoveryRecoveryCode) {
      passwordRecovery = new PasswordRecovery(
        passwordRecoveryRecoveryCode,
        passwordRecoveryExpirationDate,
        passwordRecoveryIsUsed,
      );
    } else {
      passwordRecovery = null;
    }

    return new UserModel(id, createdAt, accountData, banInfo, emailConfirmation, passwordRecovery);
  }

  public static toMongo(user: UserModel): User {
    const recoveryCode = user.passwordRecovery ? user.passwordRecovery.recoveryCode : null;
    const isUsed = user.passwordRecovery ? user.passwordRecovery.isUsed : null;
    const expirationDate = user.passwordRecovery ? user.passwordRecovery.expirationDate : null;

    return new User(
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

  public static toView(user: UserModel | User): ViewUserDto {
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

  public static toViewMe(user: UserModel): ViewMeDto {
    return new ViewMeDto(user.id, user.accountData.login, user.accountData.email);
  }
}
