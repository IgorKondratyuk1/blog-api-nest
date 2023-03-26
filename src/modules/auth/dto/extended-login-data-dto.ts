export class ExtendedLoginDataDto {
  constructor(
    public loginOrEmail: string,
    public password: string,
    public ip: string,
    public title: string,
  ) {}
}
