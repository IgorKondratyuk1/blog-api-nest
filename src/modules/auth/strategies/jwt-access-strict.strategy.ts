import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SecurityDevicesService } from '../../security-devices/security-devices.service';
import { UsersService } from '../../users/users.service';
import { AuthTokenPayloadDto } from '../dto/auth-token-payload.dto';
import { SecurityConfigService } from '../../../config/config-services/security-config.service';
import UserModel from '../../users/models/user.model';
import { SecurityDeviceModel } from '../../security-devices/models/security-device.model';

@Injectable()
export class JwtAccessStrictStrategy extends PassportStrategy(Strategy, 'jwt-access-strict') {
  constructor(
    private usersService: UsersService,
    private securityDevicesService: SecurityDevicesService,
    private securityConfigService: SecurityConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: securityConfigService.jwtSecret,
    });
  }

  async validate(payload: any): Promise<AuthTokenPayloadDto> {
    if (!payload.userId || !payload.deviceId || !payload.lastActiveDate) {
      throw new UnauthorizedException('not found necessary data in token');
    }

    const user: UserModel | null = await this.usersService.findById(payload.userId);
    if (!user) throw new UnauthorizedException('user not found');
    if (user.banInfo.isBanned) throw new UnauthorizedException('user is banned');

    const device: SecurityDeviceModel | null = await this.securityDevicesService.findDeviceSessionByDeviceId(
      payload.deviceId,
    );
    if (!device) throw new UnauthorizedException('device not found');

    return new AuthTokenPayloadDto(payload.userId, user.accountData.login, payload.deviceId, payload.lastActiveDate);
  }
}
