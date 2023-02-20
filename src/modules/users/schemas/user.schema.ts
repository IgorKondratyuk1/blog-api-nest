import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Account, AccountSchema } from './account.schema';
import {
  EmailConfirmation,
  EmailConfirmationSchema,
} from './email-confirmation.schema';
import {
  PasswordRecovery,
  PasswordRecoverySchema,
} from './password-recovery.schema';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { add } from 'date-fns';
import { CreateUserDto } from '../dto/create-user.dto';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  constructor(
    login: string,
    email: string,
    passwordHash: string,
    isConfirmed = false,
  ) {
    this.id = randomUUID();
    this.accountData = {
      login,
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    this.emailConfirmation = {
      confirmationCode: randomUUID(),
      expirationDate: add(new Date(), {
        hours: 1,
      }).toISOString(),
      isConfirmed: isConfirmed,
    };
    this.passwordRecovery = null; // TODO check recovery
  }

  @Prop({ type: String, required: true, default: randomUUID })
  id: string;

  @Prop({ type: AccountSchema })
  accountData: Account;

  @Prop({ type: EmailConfirmationSchema })
  emailConfirmation: EmailConfirmation;

  @Prop({ type: PasswordRecoverySchema })
  passwordRecovery: PasswordRecovery;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  canBeConfirmed(code: string) {
    return (
      this.emailConfirmation.confirmationCode === code &&
      new Date(this.emailConfirmation.expirationDate) > new Date()
    );
  }

  confirm(code: string) {
    if (this.emailConfirmation.isConfirmed)
      throw new Error('User is already confirmed');
    if (this.canBeConfirmed(code)) this.emailConfirmation.isConfirmed = true;
  }

  async isPasswordCorrect(password: string) {
    return await bcrypt.compare(password, this.accountData.passwordHash);
  }

  setEmailConfirmationCode(code: string) {
    if (this.emailConfirmation.isConfirmed)
      throw new Error(
        'Can not set new confirmation code, if code was confirmed',
      );
    this.emailConfirmation.confirmationCode = code;
  }

  async setPassword(newPassword: string) {
    if (this.passwordRecovery && this.passwordRecovery.isUsed)
      throw new Error(
        'Password recovery object is not created or already used',
      );
    if (
      !this.passwordRecovery?.expirationDate ||
      new Date(this.passwordRecovery.expirationDate) < new Date()
    )
      throw new Error('Password recovery date have expired or not created');

    const newPasswordHash: string = await User.generatePasswordHash(
      newPassword,
    );
    this.accountData.passwordHash = newPasswordHash;
  }

  async createNewPasswordRecoveryCode() {
    const user = this as User;
    const recoveryData: PasswordRecovery = new PasswordRecovery();
    user.passwordRecovery = recoveryData;
  }

  public static async generatePasswordHash(password: string) {
    const passwordSalt: string = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, passwordSalt);
  }

  public static async createInstance(
    createUserDto: CreateUserDto,
    isConfirmed = false,
  ) {
    const passwordHash: string = await User.generatePasswordHash(
      createUserDto.password,
    );
    return new User(
      createUserDto.login,
      createUserDto.email,
      passwordHash,
      isConfirmed,
    );
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods = {
  canBeConfirmed: User.prototype.canBeConfirmed,
  confirm: User.prototype.confirm,
  isPasswordCorrect: User.prototype.isPasswordCorrect,
  setEmailConfirmationCode: User.prototype.setEmailConfirmationCode,
  setPassword: User.prototype.setPassword,
  createNewPasswordRecoveryCode: User.prototype.createNewPasswordRecoveryCode,
};

UserSchema.statics = {
  generatePasswordHash: User.generatePasswordHash,
  createInstance: User.createInstance,
};
