export class BanInfoEntity {
  public isBanned: boolean;
  public banDate: Date | null;

  constructor(isBanned: boolean, banDate: Date | null) {
    this.isBanned = isBanned;
    this.banDate = banDate;
  }
}
