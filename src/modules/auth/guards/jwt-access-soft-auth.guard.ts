import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { SecurityConfigService } from '../../../config/config-services/security-config.service';
import { AuthUserPayloadDto } from '../dto/auth-user-payload.dto';

@Injectable()
export class JwtAccessSoftAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private securityConfigService: SecurityConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        const result = await this.jwtService.verifyAsync(token, {
          secret: this.securityConfigService.jwtSecret,
          ignoreExpiration: false,
        });
        console.log(result);
        request.user = new AuthUserPayloadDto(result.userId);
        return true;
      } catch (e) {
        console.log(e);
      }
    }

    request.user = new AuthUserPayloadDto(null);
    return true;
  }
}
