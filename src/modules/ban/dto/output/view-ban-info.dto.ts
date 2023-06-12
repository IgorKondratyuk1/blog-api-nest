export class ViewBanInfoDto {
  public banDate: Date | null;

  constructor(public isBanned: boolean, banDate) {
    this.banDate = banDate ? banDate.toISOString() : banDate;
  }
}
