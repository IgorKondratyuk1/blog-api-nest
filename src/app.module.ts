import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './modules/users/users.module';
import { BlogCompositionModule } from './modules/blog-composition/blog-composition.module';
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
import { SuperAdminModule } from './modules/super-admin/super-admin.module';
import { BloggerModule } from './modules/blogger/blogger.module';
import { RegisterUserUseCase } from './modules/users/use-cases/register-user.use-case';
import { BanBlogUseCase } from './modules/blog-composition/modules/blogs/use-cases/ban-blog.use-case';
import { BindBlogWithUserUseCase } from './modules/blog-composition/modules/blogs/use-cases/bind-blog-with-user.use-case';
import { BanModule } from './modules/ban/ban.module';
import { BanUserBySaUseCase } from './modules/users/use-cases/ban-user-by-sa.use-case';
import { BanUserByBloggerUseCase } from './modules/users/use-cases/ban-user-by-blogger.use-case';

const CommandHandlers = [
  RegisterUserUseCase,
  BindBlogWithUserUseCase,
  BanUserBySaUseCase,
  BanBlogUseCase,
  BanUserByBloggerUseCase,
];

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
    BlogCompositionModule,
    DeleteAllModule,
    AuthModule,
    SecurityDevicesModule,
    EmailModule,
    SuperAdminModule,
    BloggerModule,
    BanModule,
  ],
  controllers: [SecurityDevicesController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    ...CommandHandlers,
  ],
})
export class AppModule {}
