export class CommentatorInfoDto {
  public userId: string;
  public userLogin: string;

  constructor(userId: string, userLogin: string) {
    this.userId = userId;
    this.userLogin = userLogin;
  }
}
