import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../models/input/create-user.dto';
import SaUserBanInfo from '../../ban/models/sa-user-ban.info';
import IdGenerator from '../../../common/utils/id-generator';
import AccountEntity from './account.entity';
import EmailConfirmationEntity from './email-confirmation.entity';
import PasswordRecoveryEntity from './password-recovery.entity';

export default class UserEntity {
  public id: string;
  public createdAt: Date;
  public accountData: AccountEntity;
  public banInfo: SaUserBanInfo;
  public emailConfirmation: EmailConfirmationEntity;
  public passwordRecovery: PasswordRecoveryEntity;

  constructor(
    id: string,
    createdAt: Date,
    accountData: AccountEntity,
    banInfo: SaUserBanInfo,
    emailConfirmation: EmailConfirmationEntity,
    passwordRecovery: PasswordRecoveryEntity,
  ) {
    this.id = id;
    this.createdAt = createdAt;
    this.accountData = accountData;
    this.banInfo = banInfo;
    this.emailConfirmation = emailConfirmation;
    this.passwordRecovery = passwordRecovery;
  }

  public canBeConfirmed(code: string) {
    return (
      this.emailConfirmation.confirmationCode === code && new Date(this.emailConfirmation.expirationDate) > new Date()
    );
  }

  public confirm(code: string) {
    if (this.emailConfirmation.isConfirmed) throw new Error('UserEntity is already confirmed');
    if (this.canBeConfirmed(code)) this.emailConfirmation.isConfirmed = true;
  }

  public setIsBanned(isBanned: boolean, banReason: string) {
    if (!banReason) throw new Error('Can not ban user without "ban reason"');
    this.banInfo.isBanned = isBanned;

    if (isBanned) {
      this.banInfo.banReason = banReason;
      this.banInfo.banDate = new Date();
    } else {
      this.banInfo.banReason = null;
      this.banInfo.banDate = null;
    }
  }

  public setEmailConfirmationCode(code: string) {
    if (this.emailConfirmation.isConfirmed) throw new Error('Can not set new confirmation code, if code was confirmed');
    this.emailConfirmation.confirmationCode = code;
  }

  public createNewPasswordRecoveryCode() {
    const expirationDate = PasswordRecoveryEntity.generateNewExpirationDate();
    this.passwordRecovery = new PasswordRecoveryEntity(IdGenerator.generate(), expirationDate, false);
  }

  public async setPassword(newPassword: string) {
    if (this.passwordRecovery && this.passwordRecovery.isUsed) {
      throw new Error('Password recovery object is not created or already used');
    }

    if (!this.passwordRecovery?.expirationDate || new Date(this.passwordRecovery.expirationDate) < new Date()) {
      throw new Error('Password recovery date have expired or not created');
    }

    this.accountData.passwordHash = await UserEntity.generatePasswordHash(newPassword);
  }

  public async isPasswordCorrect(password: string) {
    return await bcrypt.compare(password, this.accountData.passwordHash);
  }

  private static async generatePasswordHash(password: string) {
    const passwordSalt: string = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, passwordSalt);
  }

  public static async createInstance(createUserDto: CreateUserDto, isConfirmed = false) {
    const creationDate: Date = new Date();
    const passwordHash: string = await UserEntity.generatePasswordHash(createUserDto.password);
    const accountData: AccountEntity = AccountEntity.createInstance(
      createUserDto.login,
      createUserDto.email,
      passwordHash,
      new Date(),
    );
    const banInfo: SaUserBanInfo = new SaUserBanInfo(false, null, null);
    const emailConfirmation: EmailConfirmationEntity = EmailConfirmationEntity.createInstance();

    return new UserEntity(IdGenerator.generate(), creationDate, accountData, banInfo, emailConfirmation, null);
  }
}
