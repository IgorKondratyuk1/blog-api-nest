import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Account, AccountSchema } from './account.schema';
import { EmailConfirmation, EmailConfirmationSchema } from './email-confirmation.schema';
import { PasswordRecovery, PasswordRecoverySchema } from './password-recovery.schema';
import { BanExtendedInfo, BanExtendedInfoSchema } from '../../../../ban/schemas/ban-extended-info.schema';

// TODO export class User extends Document
@Schema()
export class User {
  constructor(
    id: string,
    login: string,
    email: string,
    passwordHash: string,
    createdAt: Date,
    confirmationCode: string,
    emailExpirationDate: Date,
    isConfirmed: boolean,
    isBanned: boolean,
    banDate: Date | null,
    banReason: string | null,
    isUsed: boolean | null,
    passwordExpirationDate: Date | null,
    recoveryCode: string | null,
  ) {
    this._id = id;
    this.id = id;
    this.createdAt = createdAt;
    this.accountData = new Account(login, email, passwordHash, createdAt);
    this.emailConfirmation = new EmailConfirmation(confirmationCode, emailExpirationDate, isConfirmed);
    this.banInfo = new BanExtendedInfo(isBanned, banDate, banReason);
    this.passwordRecovery =
      recoveryCode && emailExpirationDate ? new PasswordRecovery(recoveryCode, emailExpirationDate, isUsed) : null;
  }

  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: BanExtendedInfoSchema })
  banInfo: BanExtendedInfo;

  @Prop({ type: AccountSchema })
  accountData: Account;

  @Prop({ type: EmailConfirmationSchema })
  emailConfirmation: EmailConfirmation;

  @Prop({ type: PasswordRecoverySchema, required: false })
  passwordRecovery: PasswordRecovery | null;

  @Prop({ type: Date })
  createdAt: Date;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);