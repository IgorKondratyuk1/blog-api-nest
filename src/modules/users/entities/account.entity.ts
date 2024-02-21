export default class AccountEntity {
  constructor(public login: string, public email: string, public passwordHash: string, public createdAt: Date) {}

  public static createInstance(login: string, email: string, passwordHash: string, createdAt: Date): AccountEntity {
    return new AccountEntity(login, email, passwordHash, createdAt);
  }
}
