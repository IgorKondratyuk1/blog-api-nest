export default class Account {
  constructor(public login: string, public email: string, public passwordHash: string, public createdAt: Date) {}

  public static createInstance(login: string, email: string, passwordHash: string, createdAt: Date): Account {
    return new Account(login, email, passwordHash, createdAt);
  }
}
