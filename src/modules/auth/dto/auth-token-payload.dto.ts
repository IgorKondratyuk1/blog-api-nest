import { AuthUserPayloadDto } from './auth-user-payload.dto';

export class AuthTokenPayloadDto extends AuthUserPayloadDto {
  constructor(
    userId: string,
    public userLogin: string,
    public deviceId: string,
    public lastActiveDate: string,
  ) {
    super(userId);
  }
}
