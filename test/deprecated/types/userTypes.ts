import {WithId} from "mongodb";
import {HydratedDocument} from "mongoose";

export type AccountType = {
    login: string
    email: string
    passwordHash: string,
    createdAt: string
}
export type EmailConfirmationType = {
    confirmationCode: string,
    expirationDate: string,
    isConfirmed: boolean
}
export type PasswordRecoveryType = {
    recoveryCode?: string,
    expirationDate?: string,
    isUsed?: boolean
}
export type UserAccountType = {
    id: string,
    accountData: AccountType,
    emailConfirmation: EmailConfirmationType,
    passwordRecovery: PasswordRecoveryType,
    createdAt: Date,
    updatedAt: Date
}
export type GuestUserType = {
    id: string | null
}
export type UserAccountDbType = WithId<{
    id: string
    accountData: AccountType,
    emailConfirmation: EmailConfirmationType,
    passwordRecovery: PasswordRecoveryType,
    createdAt: Date,
    updatedAt: Date
}>
export type UserAccountDbMethodsType = {
    canBeConfirmed(code: string): boolean,
    confirm(code: string): void,
    setEmailConfirmationCode(code: string): void,
    isPasswordCorrect(password: string): Promise<boolean>,
    createNewPasswordRecoveryCode(): Promise<HydratedUser>,
    setPassword(newPassword: string): Promise<void>
}

export type HydratedUser = HydratedDocument<UserAccountDbType, UserAccountDbMethodsType>;