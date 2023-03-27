import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './modules/users/users.module';
import { BlogsCompositionModule } from './modules/blogs-composition/blogs-composition.module';
import { DeleteAllModule } from './modules/delete-all/delete-all.module';
import { ConfigModule } from '@nestjs/config';
import { getConfiguration } from './config/configuration';
import { DbConfigService } from './config/config-services/db-config.service';
import { AppConfigModule } from './config/app-config.module';
import { AuthModule } from './modules/auth/auth.module';
import { SecurityDevicesModule } from './modules/security-devices/security-devices.module';
import { EmailModule } from './modules/email/email.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { SecurityDevicesController } from './modules/security-devices/security-devices.controller';
import { APP_GUARD } from '@nestjs/core';
import { SecurityConfigService } from './config/config-services/security-config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.local'],
      load: [getConfiguration],
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [SecurityConfigService],
      useFactory: (securityConfigService: SecurityConfigService) => ({
        ttl: securityConfigService.requestsTTL,
        limit: securityConfigService.requestsLimit,
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [DbConfigService],
      useFactory: async (dbConfigService: DbConfigService) => ({
        uri: dbConfigService.dbBaseUri,
        dbName: dbConfigService.dbName,
      }),
    }),
    UsersModule,
    BlogsCompositionModule,
    DeleteAllModule,
    AppConfigModule,
    AuthModule,
    SecurityDevicesModule,
    EmailModule,
  ],
  controllers: [SecurityDevicesController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
