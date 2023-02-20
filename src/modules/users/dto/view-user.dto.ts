export default class ViewUserDto {
  constructor(
    public id: string,
    public login: string,
    public email: string,
    public createdAt: string,
  ) {}
}
