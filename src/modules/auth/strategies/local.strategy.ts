import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { UserDocument } from '../../users/schemas/user.schema';
import { AuthUserPayloadDto } from '../dto/auth-user-payload.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'loginOrEmail' });
  }

  async validate(loginOrEmail: string, password: string): Promise<AuthUserPayloadDto> {
    console.log('LocalStrategy');
    console.log({ loginOrEmail, password });

    const user: UserDocument | null = await this.authService.validateUser(loginOrEmail, password);
    if (!user) throw new UnauthorizedException('user not valid');
    if (user.banInfo.isBanned) throw new UnauthorizedException('user is banned');

    return new AuthUserPayloadDto(user.id);
  }
}
