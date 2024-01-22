import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../configuration';

@Injectable()
export class SecurityConfigService {
  constructor(private configService: ConfigService<ConfigurationType>) {}

  get jwtSecret(): string {
    return this.configService.get('SECURITY', { infer: true }).JWT_SECRET ?? 'SecrEtToKeN11fsdagdsf';
  }

  get accessTokenExpirationSeconds(): number {
    const accessTokenExpiration: string = this.configService.get('SECURITY', {
      infer: true,
    }).ACCESS_TOKEN_EXPIRATION_SEC;
    return accessTokenExpiration ? Number(accessTokenExpiration) : 10;
  }

  get refreshTokenExpirationSeconds(): number {
    const refreshTokenExpiration: string = this.configService.get('SECURITY', {
      infer: true,
    }).REFRESH_TOKEN_EXPIRATION_SEC;
    return refreshTokenExpiration ? Number(refreshTokenExpiration) : 20;
  }

  get expiredDeviceSessionDays(): number {
    const expiredDeviceSession: string = this.configService.get('SECURITY', {
      infer: true,
    }).EXPIRED_DEVICE_SESSION_DAYS;
    return expiredDeviceSession ? Number(expiredDeviceSession) : 5;
  }

  get requestsTTL(): number {
    const requestsTTL: string = this.configService.get('SECURITY', {
      infer: true,
    }).REQUESTS_TTL_SEC;
    return requestsTTL ? Number(requestsTTL) : 10;
  }

  get requestsLimit(): number {
    const requestsLimit: string = this.configService.get('SECURITY', {
      infer: true,
    }).REQUESTS_LIMIT;
    return requestsLimit ? Number(requestsLimit) : 5;
  }

  get basicUsername(): string {
    const basicUsername: string = this.configService.get('SECURITY', {
      infer: true,
    }).HTTP_BASIC_USER;
    return basicUsername;
  }

  get basicPassword(): string {
    const basicPassword: string = this.configService.get('SECURITY', {
      infer: true,
    }).HTTP_BASIC_PASSWORD;
    return basicPassword;
  }
}
