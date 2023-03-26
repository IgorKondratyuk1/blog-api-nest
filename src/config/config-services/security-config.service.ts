import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../configuration';

@Injectable()
export class SecurityConfigService {
  constructor(private configService: ConfigService<ConfigurationType>) {}

  get jwtSecret(): string {
    return (
      this.configService.get('SECURITY', { infer: true }).JWT_SECRET ?? 'SecrEtToKeN11fsdagdsf'
    );
  }

  get accessTokenExpirationSeconds(): number {
    const accessTokenExpiration: string = this.configService.get('SECURITY', {
      infer: true,
    }).ACCESS_TOKEN_EXPIRATION_SEC;
    return accessTokenExpiration ? Number(accessTokenExpiration) : 20;
  }

  get refreshTokenExpirationSeconds(): number {
    const refreshTokenExpiration: string = this.configService.get('SECURITY', {
      infer: true,
    }).REFRESH_TOKEN_EXPIRATION_SEC;
    return refreshTokenExpiration ? Number(refreshTokenExpiration) : 50;
  }

  get expiredDeviceSessionDays(): number {
    const expiredDeviceSession: string = this.configService.get('SECURITY', {
      infer: true,
    }).EXPIRED_DEVICE_SESSION_DAYS;
    return expiredDeviceSession ? Number(expiredDeviceSession) : 5;
  }

  get debounceTimeMs(): number {
    const debounceTime: string = this.configService.get('SECURITY', {
      infer: true,
    }).DEBOUNCE_TIME_MS;
    return debounceTime ? Number(debounceTime) : 10000;
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
