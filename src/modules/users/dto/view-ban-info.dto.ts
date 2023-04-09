export class ViewBanInfoDto {
  public banDate: Date | null;

  constructor(public isBanned: boolean, public banReason: string | null, banDate) {
    this.banDate = banDate ? banDate.toISOString() : banDate;
  }
}
