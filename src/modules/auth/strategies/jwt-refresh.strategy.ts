import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserDocument } from '../../users/schemas/user.schema';
import { SecurityDevicesService } from '../../security-devices/security-devices.service';
import { UsersService } from '../../users/users.service';
import { SecurityDeviceDocument } from '../../security-devices/schemas/device.schema';
import { AuthTokenPayloadDto } from '../dto/auth-token-payload.dto';
import { SecurityConfigService } from '../../../config/config-services/security-config.service';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private usersService: UsersService,
    private securityDevicesService: SecurityDevicesService,
    private securityConfigService: SecurityConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([JwtRefreshStrategy.extractFromCookies]),
      ignoreExpiration: false,
      secretOrKey: securityConfigService.jwtSecret,
    });
  }

  async validate(payload: any): Promise<AuthTokenPayloadDto> {
    console.log('JwtRefreshStrategy');
    console.log(payload);

    if (!payload.userId || !payload.deviceId || !payload.lastActiveDate) {
      throw new UnauthorizedException('not found necessary data in token');
    }

    const user: UserDocument | null = await this.usersService.findById(payload.userId);
    if (!user) throw new UnauthorizedException();

    const device: SecurityDeviceDocument | null =
      await this.securityDevicesService.findDeviceSession(payload.deviceId);

    if (!device) throw new UnauthorizedException('device not found');

    // 4. Check that token is valid
    if (device.lastActiveDate.toISOString() !== payload.lastActiveDate) {
      throw new UnauthorizedException('activation date is expired');
      return;
    }

    return new AuthTokenPayloadDto(
      payload.userId,
      user.accountData.login,
      payload.deviceId,
      payload.lastActiveDate,
    );
  }

  private static extractFromCookies(req: Request): string | null {
    if (req.cookies && 'refreshToken' in req.cookies) {
      return req.cookies.refreshToken;
    }
    return null;
  }
}
