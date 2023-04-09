import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { SecurityDevicesModule } from '../security-devices/security-devices.module';
import { PassportModule } from '@nestjs/passport';
import { EmailModule } from '../email/email.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { BasicStrategy } from './strategies/basic.strategy';
import { SecurityConfigService } from '../../config/config-services/security-config.service';
import { JwtAccessStrictStrategy } from './strategies/jwt-access-strict.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { EmailResendRule } from './validators/resend-email.validator';
import { CodeResendRule } from './validators/resend-code.validator';
import { CqrsModule } from '@nestjs/cqrs';

@Global()
@Module({
  imports: [
    PassportModule,
    UsersModule,
    SecurityDevicesModule,
    EmailModule,
    CqrsModule,
    JwtModule.registerAsync({
      inject: [SecurityConfigService],
      useFactory: async (securityConfigService: SecurityConfigService) => ({
        secret: securityConfigService.jwtSecret,
        signOptions: {
          expiresIn: securityConfigService.accessTokenExpirationSeconds,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtAccessStrictStrategy,
    JwtRefreshStrategy,
    BasicStrategy,
    JwtService,
    EmailResendRule,
    CodeResendRule,
  ],
  exports: [JwtService],
})
export class AuthModule {}
