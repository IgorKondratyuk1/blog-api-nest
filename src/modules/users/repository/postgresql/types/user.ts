export type dbFullUser = {
  userId: string;
  userBanId: string | null;
  createdAt: Date;
  accountId: string;
  login: string;
  email: string;
  passwordHash: string;
  emailConfirmationCode: string;
  emailCodeExpirationDate: Date;
  isEmailConfirmed: boolean;
  passwordRecoveryCode: string | null;
  passwordRecoveryExpirationDate: Date | null;
  isRecoveryUsed: boolean | null;
  banDate: Date | null;
  banReason: string | null;
};

export type dbUser = {
  id: string;
  createdAt: Date;
  userBanId: string | null;
  accountId: string;
  passwordRecoveryId: string;
  emailConfirmationId: string;
};
