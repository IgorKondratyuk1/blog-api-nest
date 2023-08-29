import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dto/input/create-user.dto';
import Account from './account.model';
import EmailConfirmation from './email-confirmation.model';
import PasswordRecovery from './password-recovery.model';
import SaUserBanInfo from '../../ban/models/sa-user-ban.info';
import IdGenerator from '../../../common/utils/id-generator';

export default class UserModel {
  public id: string;
  public createdAt: Date;
  public accountData: Account;
  public banInfo: SaUserBanInfo;
  public emailConfirmation: EmailConfirmation;
  public passwordRecovery: PasswordRecovery;

  constructor(
    id: string,
    createdAt: Date,
    accountData: Account,
    banInfo: SaUserBanInfo,
    emailConfirmation: EmailConfirmation,
    passwordRecovery: PasswordRecovery,
  ) {
    this.id = id;
    this.createdAt = createdAt;
    this.accountData = accountData;
    this.banInfo = banInfo;
    this.emailConfirmation = emailConfirmation;
    this.passwordRecovery = passwordRecovery;
  }

  canBeConfirmed(code: string) {
    return (
      this.emailConfirmation.confirmationCode === code && new Date(this.emailConfirmation.expirationDate) > new Date()
    );
  }

  confirm(code: string) {
    if (this.emailConfirmation.isConfirmed) throw new Error('User is already confirmed');
    if (this.canBeConfirmed(code)) this.emailConfirmation.isConfirmed = true;
  }

  setIsBanned(isBanned: boolean, banReason: string) {
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

  setEmailConfirmationCode(code: string) {
    if (this.emailConfirmation.isConfirmed) throw new Error('Can not set new confirmation code, if code was confirmed');
    this.emailConfirmation.confirmationCode = code;
  }

  createNewPasswordRecoveryCode() {
    const expirationDate = PasswordRecovery.generateNewExpirationDate();
    this.passwordRecovery = new PasswordRecovery(IdGenerator.generate(), expirationDate, false);
  }

  async setPassword(newPassword: string) {
    if (this.passwordRecovery && this.passwordRecovery.isUsed) {
      throw new Error('Password recovery object is not created or already used');
    }

    if (!this.passwordRecovery?.expirationDate || new Date(this.passwordRecovery.expirationDate) < new Date()) {
      throw new Error('Password recovery date have expired or not created');
    }

    this.accountData.passwordHash = await UserModel.generatePasswordHash(newPassword);
  }

  async isPasswordCorrect(password: string) {
    return await bcrypt.compare(password, this.accountData.passwordHash);
  }

  public static async generatePasswordHash(password: string) {
    const passwordSalt: string = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, passwordSalt);
  }

  public static async createInstance(createUserDto: CreateUserDto, isConfirmed = false) {
    const creationDate: Date = new Date();
    const passwordHash: string = await UserModel.generatePasswordHash(createUserDto.password);
    const accountData: Account = Account.createInstance(
      createUserDto.login,
      createUserDto.email,
      passwordHash,
      new Date(),
    );
    const banInfo: SaUserBanInfo = new SaUserBanInfo(false, null, null);
    const emailConfirmation: EmailConfirmation = EmailConfirmation.createInstance();

    return new UserModel(IdGenerator.generate(), creationDate, accountData, banInfo, emailConfirmation, null);
  }
}
