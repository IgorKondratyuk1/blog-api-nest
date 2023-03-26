export class AuthTokensDto {
  constructor(public accessToken: string, public refreshToken: string) {}
}
